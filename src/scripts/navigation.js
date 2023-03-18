import {
  shouldNotIntercept,
  updateTheDOMSomehow,
  findCardByPath,
  getPersistentElement,
  getPersistentElementContainer,
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

      // Make sure there are no other cards with the 'with-transition' class
      document
        .querySelectorAll('.card')
        .forEach((card) => card.classList.remove('with-transition'))

      const card = findCardByPath(toPath)
      let persistentEl

      // Add the 'with-transition' class to the card that is transitioning
      // and save a reference to any persistent elements (like video) if they exist
      if (card) {
        card.classList.add('with-transition')
        persistentEl = getPersistentElement(card)
      }

      // Save the page scroll to restore it on the way back
      prevPageScroll = document.documentElement.scrollTop

      document.startViewTransition(() => {
        updateTheDOMSomehow(data)
        document.documentElement.scrollTop = 0

        const persistentElContainer = getPersistentElementContainer()

        // Place the persistent element into its container in the updated DOM
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

      // Save a reference to any persistent elements (like video) if they exist
      const persistentEl = getPersistentElement()

      document.startViewTransition(() => {
        updateTheDOMSomehow(data)

        // Find the card that matches the playlist we're transitioning back from
        const card = findCardByPath(fromPath)

        // Add the 'with-transition' class to the transitioning card and
        // place the persistent element its container in the updated DOM
        if (card) {
          card.classList.add('with-transition')
          const persistentElContainer = getPersistentElementContainer(card)

          if (persistentEl && persistentElContainer) {
            persistentElContainer.replaceChildren(persistentEl)
          }
        }

        // Restore page scroll
        if (prevPageScroll) {
          document.documentElement.scrollTop = prevPageScroll
        }
      })
    },
  })
}
