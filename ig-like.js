// ==UserScript==
// @name         Remove Instagram Like Button
// @namespace    http://tampermonkey.net/
// @version      2026-02-07
// @description  Removes like button from the instagram website UI
// @author       You
// @match        https://*/*
// @grant        none
// ==/UserScript==
// Your code here...
    (function() {
    'use strict';
    // selectors detected in page source denoting instagram 'like' features
    const LIKE_SIGS = [
        'svg[aria-label="Like"]',
        'svg[aria-label="Unlike"]',
        'div[role="button"]:has(svg[aria-label*="Like"])',
        'button:has(svg[aria-label*="Like"])',
        'button:has(svg[aria-label*="like"])',
        'div:has(> svg[aria-label*="Like"])',
        'div[role="button"][tabindex="0"]:has(svg)',
        'article div[role="button"]',
        'section[role="button"]'
    ];

    console.log('Instagram Like Button Blocker loaded permanently.');

    // Finds and hides 'like' elements
    function hideLikeElements() {
        LIKE_SIGS.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    // checks element parent structure if unsure
                    if (isLikeButton(element)) {
                        const container = findBestContainer(element);
                        if (container && !container.hasAttribute('data-like-blocked')) {
                            container.style.cssText = 'display: none !important; visibility: hidden !important;';
                            container.setAttribute('data-like-blocked', 'true');

                            // disable click objects
                            container.onclick = null;
                            container.removeEventListener('click', () => {});
                        }
                    }
                });
            } catch (e) {
                // ignore selector errors
            }
        });
    }

    // identify like buttons
    function isLikeButton(element) {
        const ariaLabel = element.getAttribute('aria-label') || '';
        const textContent = element.textContent || '';
        const parentText = element.parentElement?.textContent || '';

        // text check
        if (ariaLabel.toLowerCase().includes('like') ||
            textContent.toLowerCase().includes('like') ||
            parentText.toLowerCase().includes('like')) {
            return true;
        }

        // heart icon check
        const svg = element.querySelector('svg') || element;
        const svgPath = svg.innerHTML || '';
        if (svgPath.includes('heart') || svgPath.includes('M469.335') ||
            svgPath.includes('like') || svgPath.includes('favorite')) {
            return true;
        }

        return false;
    }

    // selects container to hide
    function findBestContainer(element) {
        const containers = [
            element.closest('div[role="button"]'),
            element.closest('button'),
            element.closest('article div'),
            element.closest('section'),
            element.parentElement,
            element
        ];

        return containers.find(container => container !== null);
    }

    // delay
    let refreshTime;
    function refreshHide() {
        clearTimeout(refreshTime);
        refreshTime = setTimeout(hideLikeElements, 100);
    }

    hideLikeElements();

    // check page updates
    const observer = new MutationObserver((mutations) => {
        let shouldRun = false;
        mutations.forEach(mutation => {
            if (mutation.addedNodes.length > 0) {
                shouldRun = true;
            }
        });
        if (shouldRun) {
            refreshHide();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false,
        characterData: false
    });

    const attrObserver = new MutationObserver(refreshHide);
    attrObserver.observe(document.body, {
        attributes: true,
        subtree: true,
        attributeFilter: ['class', 'style', 'aria-label']
    });

    // infinite scroll
    window.addEventListener('scroll', refreshHide, { passive: true });

    setInterval(hideLikeElements, 2000);

    console.log('Instagram Like Button Blocker is active.');

})();