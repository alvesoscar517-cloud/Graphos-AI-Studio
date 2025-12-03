/**
 * Queue Service - Powered by BullMQ
 * Background job processing with Redis-backed queues
 * 
 * Features:
 * - Multiple queue support (email, analysis, etc.)
 * - Job scheduling and delayed jobs
 * - Retry with exponential backoff
 * - Concurrency control
 * - Job progress tracking
 * 
 * @module services/queue
 */

const { Queue, Worker, QueueScheduler, QueueEvents } = require('bullmq');
const logger = require('../utils/logger');
const config = require('../config');

// ============================================================================
// CONFIGURATION
// ============================================================================

const REDIS_URL = config.REDIS_URL || 'redis://localhost:6379';

/**
 * Parse Redis URL to connection options
 */
function parseRedisUrl(url) {
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parseInt(parsed.port) || 6379,
      password: parsed.password || undefined,
      username: parsed.username || undefined
    };
  } catch {
    return { host: 'localhost', port: 6379 };
  }
}

const connection = parseRedisUrl(REDIS_URL);

/**
 * Default job options
 */
const DEFAULT_JOB_OPTIONS = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 1000
  },
  removeOnComplete: {
    count: 100,
    age: 24 * 60 * 60 // 24 hours
  },
  removeOnFail: {
    count: 500,
    age: 7 * 24 * 60 * 60 // 7 days
  }
};


// ============================================================================
// QUEUE INSTANCES
// ============================================================================

const queues = new Map();
const workers = new Map();
const schedulers = new Map();

/**
 * Queue names
 */
const QUEUE_NAMES = {
  EMAIL: 'email',
  ANALYSIS: 'analysis',
  NOTIFICATION: 'notification',
  CLEANUP: 'cleanup'
};

/**
 * Get or create a queue
 * @param {string} name - Queue name
 * @param {Object} options - Queue options
 * @returns {Queue} BullMQ Queue instance
 */
function getQueue(name, options = {}) {
  if (!queues.has(name)) {
    const queue = new Queue(name, {
      connection,
      defaultJobOptions: { ...DEFAULT_JOB_OPTIONS, ...options.defaultJobOptions }
    });
    
    queue.on('error', (error) => {
      logger.error('Queue error', { queue: name, error: error.message });
    });
    
    queues.set(name, queue);
    logger.info('Queue created', { name });
  }
  
  return queues.get(name);
}

/**
 * Create a worker for a queue
 * @param {string} queueName - Queue name
 * @param {Function} processor - Job processor function
 * @param {Object} options - Worker options
 * @returns {Worker} BullMQ Worker instance
 */
function createWorker(queueName, processor, options = {}) {
  const workerOptions = {
    connection,
    concurrency: options.concurrency || 5,
    limiter: options.limiter || undefined,
    ...options
  };
  
  const worker = new Worker(queueName, processor, workerOptions);
  
  worker.on('completed', (job) => {
    logger.debug('Job completed', { queue: queueName, jobId: job.id, name: job.name });
  });
  
  worker.on('failed', (job, error) => {
    logger.error('Job failed', { 
      queue: queueName, 
      jobId: job?.id, 
      name: job?.name,
      error: error.message,
      attempts: job?.attemptsMade
    });
  });
  
  worker.on('error', (error) => {
    logger.error('Worker error', { queue: queueName, error: error.message });
  });
  
  workers.set(queueName, worker);
  logger.info('Worker created', { queue: queueName, concurrency: workerOptions.concurrency });
  
  return worker;
}

// ============================================================================
// JOB OPERATIONS
// ============================================================================

/**
 * Add a job to a queue
 * @param {string} queueName - Queue name
 * @param {string} jobName - Job name/type
 * @param {Object} data - Job data
 * @param {Object} options - Job options
 * @returns {Promise<Job>} Created job
 */
async function addJob(queueName, jobName, data, options = {}) {
  const queue = getQueue(queueName);
  
  const job = await queue.add(jobName, data, {
    ...DEFAULT_JOB_OPTIONS,
    ...options
  });
  
  logger.debug('Job added', { queue: queueName, jobId: job.id, name: jobName });
  
  return job;
}

/**
 * Add a delayed job
 * @param {string} queueName - Queue name
 * @param {string} jobName - Job name
 * @param {Object} data - Job data
 * @param {number} delay - Delay in milliseconds
 * @param {Object} options - Additional options
 * @returns {Promise<Job>} Created job
 */
async function addDelayedJob(queueName, jobName, data, delay, options = {}) {
  return addJob(queueName, jobName, data, { ...options, delay });
}

/**
 * Add a scheduled job (cron-like)
 * @param {string} queueName - Queue name
 * @param {string} jobName - Job name
 * @param {Object} data - Job data
 * @param {Object} repeat - Repeat options (cron, every, etc.)
 * @param {Object} options - Additional options
 * @returns {Promise<Job>} Created job
 */
async function addScheduledJob(queueName, jobName, data, repeat, options = {}) {
  return addJob(queueName, jobName, data, { ...options, repeat });
}

/**
 * Get job by ID
 * @param {string} queueName - Queue name
 * @param {string} jobId - Job ID
 * @returns {Promise<Job|null>} Job or null
 */
async function getJob(queueName, jobId) {
  const queue = getQueue(queueName);
  return queue.getJob(jobId);
}

/**
 * Remove a job
 * @param {string} queueName - Queue name
 * @param {string} jobId - Job ID
 * @returns {Promise<void>}
 */
async function removeJob(queueName, jobId) {
  const job = await getJob(queueName, jobId);
  if (job) {
    await job.remove();
    logger.debug('Job removed', { queue: queueName, jobId });
  }
}

// ============================================================================
// QUEUE MANAGEMENT
// ============================================================================

/**
 * Get queue statistics
 * @param {string} queueName - Queue name
 * @returns {Promise<Object>} Queue stats
 */
async function getQueueStats(queueName) {
  const queue = getQueue(queueName);
  
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount()
  ]);
  
  return {
    name: queueName,
    waiting,
    active,
    completed,
    failed,
    delayed,
    total: waiting + active + delayed
  };
}

/**
 * Pause a queue
 * @param {string} queueName - Queue name
 */
async function pauseQueue(queueName) {
  const queue = getQueue(queueName);
  await queue.pause();
  logger.info('Queue paused', { queue: queueName });
}

/**
 * Resume a queue
 * @param {string} queueName - Queue name
 */
async function resumeQueue(queueName) {
  const queue = getQueue(queueName);
  await queue.resume();
  logger.info('Queue resumed', { queue: queueName });
}

/**
 * Clean old jobs from a queue
 * @param {string} queueName - Queue name
 * @param {number} grace - Grace period in milliseconds
 * @param {string} status - Job status to clean
 */
async function cleanQueue(queueName, grace = 24 * 60 * 60 * 1000, status = 'completed') {
  const queue = getQueue(queueName);
  const cleaned = await queue.clean(grace, 1000, status);
  logger.info('Queue cleaned', { queue: queueName, status, cleaned: cleaned.length });
  return cleaned;
}

// ============================================================================
// SHUTDOWN
// ============================================================================

/**
 * Gracefully close all queues and workers
 */
async function closeAll() {
  logger.info('Closing queue service...');
  
  // Close workers first
  for (const [name, worker] of workers) {
    await worker.close();
    logger.debug('Worker closed', { queue: name });
  }
  
  // Close schedulers
  for (const [name, scheduler] of schedulers) {
    await scheduler.close();
    logger.debug('Scheduler closed', { queue: name });
  }
  
  // Close queues
  for (const [name, queue] of queues) {
    await queue.close();
    logger.debug('Queue closed', { queue: name });
  }
  
  workers.clear();
  schedulers.clear();
  queues.clear();
  
  logger.info('Queue service closed');
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Queue management
  getQueue,
  createWorker,
  
  // Job operations
  addJob,
  addDelayedJob,
  addScheduledJob,
  getJob,
  removeJob,
  
  // Queue operations
  getQueueStats,
  pauseQueue,
  resumeQueue,
  cleanQueue,
  
  // Lifecycle
  closeAll,
  
  // Constants
  QUEUE_NAMES,
  DEFAULT_JOB_OPTIONS,
  
  // For testing
  connection
};
