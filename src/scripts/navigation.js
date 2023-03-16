import {
  shouldNotIntercept,
  updateTheDOMSomehow,
  findCardByPath,
} from './utils'

let prevPageScroll = 0

navigation.addEventListener('navigate', (navigateEvent) => {
  if (shouldNotIntercept(navigateEvent)) return

  const toUrl = new URL(navigateEvent.destination.url)
  const toPath = toUrl.pathname
  const fromPath = location.pathname

  if (location.origin !== toUrl.origin) return

  if (toPath.indexOf('/playlist') === 0) {
    return handlePlaylistTransition(navigateEvent, toPath, fromPath)
  } else {
    return handleHomeTransition(navigateEvent, toPath, fromPath)
  }
})

function handlePlaylistTransition(navigateEvent, toPath, fromPath) {
  navigateEvent.intercept({
    scroll: 'manual',
    async handler() {
      const response = await fetch('/fragments' + toPath)
      const data = await response.text()

      if (!document.startViewTransition) {
        updateTheDOMSomehow(data)
        return
      }

      document
        .querySelectorAll('.card')
        .forEach((card) => card.classList.remove('with-transition'))
      const card = findCardByPath(toPath)
      let persistentEl

      if (card) {
        card.classList.add('with-transition')
        persistentEl = card.querySelector('[data-persist="true"]')
      }

      prevPageScroll = document.documentElement.scrollTop

      document.startViewTransition(() => {
        updateTheDOMSomehow(data)
        document.documentElement.scrollTop = 0

        const persistentElContainer = document.querySelector(
          '[data-persist-container="true"]'
        )

        if (persistentEl && persistentElContainer) {
          persistentElContainer.replaceChildren(persistentEl)
        }
      })
    },
  })
}

function handleHomeTransition(navigateEvent, toPath, fromPath) {
  navigateEvent.intercept({
    scroll: 'manual',
    async handler() {
      const response = await fetch('/fragments' + toPath)
      const data = await response.text()

      if (!document.startViewTransition) {
        updateTheDOMSomehow(data)
        return
      }

      const persistentEl = document.querySelector('[data-persist="true"]')

      document.startViewTransition(() => {
        updateTheDOMSomehow(data)

        const card = findCardByPath(fromPath)

        if (card) {
          card.classList.add('with-transition')
          const persistentElContainer = card.querySelector(
            '[data-persist-container="true"]'
          )

          if (persistentEl && persistentElContainer) {
            persistentElContainer.replaceChildren(persistentEl)
          }
        }

        if (prevPageScroll) {
          document.documentElement.scrollTop = prevPageScroll
        } else if (card) {
          card.scrollIntoViewIfNeeded()
        }
      })
    },
  })
}
