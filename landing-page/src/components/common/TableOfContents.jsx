import { useState, useEffect } from 'react'

function TableOfContents({ sections }) {
  const [activeSection, setActiveSection] = useState('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { rootMargin: '-100px 0px -80% 0px' }
    )

    sections.forEach(section => {
      const element = document.getElementById(section.id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [sections])

  const handleClick = (e, id) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if (element) {
      const offset = 100
      const top = element.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  return (
    <nav className="sticky top-24 p-4 bg-bg-secondary rounded-xl border border-gray-200">
      <h3 className="font-semibold text-text-primary mb-4">{t('common.tableOfContents')}</h3>
      <ul className="space-y-2">
        {sections.map(section => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              onClick={e => handleClick(e, section.id)}
              className={`block text-sm py-1 transition-colors ${
                activeSection === section.id
                  ? 'text-primary font-medium'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {section.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default TableOfContents
