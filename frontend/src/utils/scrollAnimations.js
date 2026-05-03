/**
 * ============================================
 * SCROLL ANIMATION UTILITY
 * Porsche-Inspired Scroll-Triggered Effects
 * Uses Intersection Observer API for Performance
 * ============================================
 */

/**
 * Initialize scroll reveal animations for elements
 * @param {string} selector - CSS selector for elements to animate
 * @param {object} options - Configuration options
 */
export const initScrollReveal = (
  selector = '.scroll-reveal',
  options = {}
) => {
  const defaultOptions = {
    threshold: 0.15, // Trigger when 15% of element is visible
    rootMargin: '0px 0px -50px 0px', // Start animation slightly before element enters viewport
    triggerOnce: true, // Only animate once
    ...options,
  };

  // Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (prefersReducedMotion) {
    // Skip animations if user prefers reduced motion
    const elements = document.querySelectorAll(selector);
    elements.forEach((el) => {
      el.classList.add('reveal-active');
    });
    return;
  }

  // Create Intersection Observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Add active class to trigger CSS animation
        entry.target.classList.add('reveal-active');

        // If triggerOnce is true, stop observing this element
        if (defaultOptions.triggerOnce) {
          observer.unobserve(entry.target);
        }
      } else if (!defaultOptions.triggerOnce) {
        // Remove active class if element leaves viewport (for repeating animations)
        entry.target.classList.remove('reveal-active');
      }
    });
  }, defaultOptions);

  // Observe all elements matching the selector
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => observer.observe(el));

  // Return observer instance for cleanup
  return observer;
};

/**
 * Initialize staggered scroll reveal for grid items
 * Automatically adds stagger classes based on position
 * @param {string} containerSelector - CSS selector for container
 * @param {string} itemSelector - CSS selector for items to stagger
 */
export const initStaggeredReveal = (
  containerSelector,
  itemSelector = '.car-card'
) => {
  const containers = document.querySelectorAll(containerSelector);

  containers.forEach((container) => {
    const items = container.querySelectorAll(itemSelector);

    items.forEach((item, index) => {
      // Add scroll-reveal class if not present
      if (!item.classList.contains('scroll-reveal')) {
        item.classList.add('scroll-reveal');
      }

      // Add stagger class based on index (1-9)
      const staggerIndex = (index % 9) + 1;
      item.classList.add(`scroll-stagger-${staggerIndex}`);
    });
  });

  // Initialize scroll reveal for these items
  return initScrollReveal(itemSelector);
};

/**
 * Initialize parallax effect on scroll
 * @param {string} selector - CSS selector for elements
 * @param {number} speed - Parallax speed (0.1 = slow, 1 = normal)
 */
export const initParallax = (selector, speed = 0.3) => {
  const elements = document.querySelectorAll(selector);

  // Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (prefersReducedMotion || elements.length === 0) return;

  const handleScroll = () => {
    const scrolled = window.pageYOffset;

    elements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      const elementTop = rect.top + scrolled;
      const offset = (scrolled - elementTop) * speed;

      element.style.transform = `translateY(${offset}px)`;
    });
  };

  // Use requestAnimationFrame for smooth animations
  let ticking = false;
  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        handleScroll();
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });

  // Return cleanup function
  return () => window.removeEventListener('scroll', onScroll);
};

/**
 * Initialize navbar scroll effects (transparency, shadow)
 * @param {string} navbarSelector - CSS selector for navbar
 * @param {number} threshold - Scroll threshold in pixels
 */
export const initNavbarScroll = (
  navbarSelector = '.navbar',
  threshold = 50
) => {
  const navbar = document.querySelector(navbarSelector);
  if (!navbar) return;

  const handleScroll = () => {
    if (window.scrollY > threshold) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  // Initial check
  handleScroll();

  window.addEventListener('scroll', handleScroll, { passive: true });

  // Return cleanup function
  return () => window.removeEventListener('scroll', handleScroll);
};

/**
 * Initialize all scroll animations at once
 * Call this function when your page/component mounts
 */
export const initAllScrollAnimations = () => {
  // Check if components exist before initializing
  const observers = [];

  // 1. Initialize general scroll reveals
  if (document.querySelector('.scroll-reveal')) {
    observers.push(initScrollReveal('.scroll-reveal'));
  }

  // 2. Initialize staggered car cards
  if (document.querySelector('.cars-grid')) {
    observers.push(initStaggeredReveal('.cars-grid', '.car-card'));
  }

  // 3. Initialize navbar scroll effect
  if (document.querySelector('.navbar')) {
    observers.push(initNavbarScroll('.navbar', 50));
  }

  // 4. Initialize parallax for hero section (optional - subtle effect)
  // Uncomment if you want parallax on hero background
  // if (document.querySelector('.hero-video')) {
  //   observers.push(initParallax('.hero-video', 0.2));
  // }

  // Return cleanup function to remove all observers
  return () => {
    observers.forEach((observer) => {
      if (observer && typeof observer === 'function') {
        observer(); // Execute cleanup
      } else if (observer && observer.disconnect) {
        observer.disconnect(); // Disconnect Intersection Observer
      }
    });
  };
};

/**
 * Utility: Add smooth scroll behavior to anchor links
 */
export const initSmoothScroll = () => {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      e.preventDefault();
      const target = document.querySelector(href);

      if (target) {
        const offsetTop = target.offsetTop - 80; // Account for fixed navbar
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth',
        });
      }
    });
  });
};

// Export default object with all functions
export default {
  initScrollReveal,
  initStaggeredReveal,
  initParallax,
  initNavbarScroll,
  initAllScrollAnimations,
  initSmoothScroll,
};
