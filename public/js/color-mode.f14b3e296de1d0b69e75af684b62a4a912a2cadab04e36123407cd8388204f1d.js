(() => {
    // <stdin>
    (() => {
        'use strict';
        const storedTheme = localStorage.getItem('theme');
        const getPreferredTheme = () => {
            if (storedTheme) {
                return storedTheme;
            }
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        };
        const setTheme = function (theme) {
            if (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.documentElement.setAttribute('data-bs-theme', 'dark');
            } else {
                document.documentElement.setAttribute('data-bs-theme', theme);
            }
        };
        setTheme(getPreferredTheme());
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            if (storedTheme !== 'light' || storedTheme !== 'dark') {
                setTheme(getPreferredTheme());
            }
        });
        window.addEventListener('DOMContentLoaded', () => {
            document.querySelectorAll('[data-bs-theme-value]').forEach((toggle) => {
                toggle.addEventListener('click', () => {
                    const theme = toggle.getAttribute('data-bs-theme-value');
                    localStorage.setItem('theme', theme);
                    setTheme(theme);
                });
            });
        });
    })();
})();
/*!
 * Modified from
 * Color mode toggler for Bootstrap's docs (https://getbootstrap.com/)
 * Copyright 2011-2022 The Bootstrap Authors
 * Licensed under the Creative Commons Attribution 3.0 Unported License.
 */
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiPHN0ZGluPiJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLyohXHJcbiAqIE1vZGlmaWVkIGZyb21cclxuICogQ29sb3IgbW9kZSB0b2dnbGVyIGZvciBCb290c3RyYXAncyBkb2NzIChodHRwczovL2dldGJvb3RzdHJhcC5jb20vKVxyXG4gKiBDb3B5cmlnaHQgMjAxMS0yMDIyIFRoZSBCb290c3RyYXAgQXV0aG9yc1xyXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQ3JlYXRpdmUgQ29tbW9ucyBBdHRyaWJ1dGlvbiAzLjAgVW5wb3J0ZWQgTGljZW5zZS5cclxuICovXHJcblxyXG4oKCkgPT4ge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNvbnN0IHN0b3JlZFRoZW1lID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3RoZW1lJyk7XHJcblxyXG4gICAgLy8gQ2hlY2sgaWYgdGhlbWUgaGFzIGJlZW4gc2V0LCBvdGhlcndpc2UgZ2V0IE9TL2Jyb3dzZXIgc2V0dGluZyBpZiBicm93c2VyIHN1cHBvcnRzXHJcbiAgICBjb25zdCBnZXRQcmVmZXJyZWRUaGVtZSA9ICgpID0+IHtcclxuICAgICAgICBpZiAoc3RvcmVkVGhlbWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHN0b3JlZFRoZW1lO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5tYXRjaE1lZGlhKCcocHJlZmVycy1jb2xvci1zY2hlbWU6IGRhcmspJykubWF0Y2hlcyA/ICdkYXJrJyA6ICdsaWdodCc7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIENoZWNrIGlmIHRoZW1lIGhhcyBiZWVuIHNldCwgYW5kIGFkZCB0aGVtZSB0byBkYXRhLWJzLXRoZW1lXHJcbiAgICBjb25zdCBzZXRUaGVtZSA9IGZ1bmN0aW9uICh0aGVtZSkge1xyXG4gICAgICAgIGlmICh0aGVtZSA9PT0gJ2F1dG8nICYmIHdpbmRvdy5tYXRjaE1lZGlhKCcocHJlZmVycy1jb2xvci1zY2hlbWU6IGRhcmspJykubWF0Y2hlcykge1xyXG4gICAgICAgICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2V0QXR0cmlidXRlKCdkYXRhLWJzLXRoZW1lJywgJ2RhcmsnKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2V0QXR0cmlidXRlKCdkYXRhLWJzLXRoZW1lJywgdGhlbWUpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgc2V0VGhlbWUoZ2V0UHJlZmVycmVkVGhlbWUoKSk7XHJcblxyXG4gICAgLypcclxuICBjb25zdCBzaG93QWN0aXZlVGhlbWUgPSAodGhlbWUsIGZvY3VzID0gZmFsc2UpID0+IHtcclxuICAgIGNvbnN0IHRoZW1lU3dpdGNoZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjYmQtdGhlbWUnKVxyXG5cclxuICAgIGlmICghdGhlbWVTd2l0Y2hlcikge1xyXG4gICAgICByZXR1cm5cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB0aGVtZVN3aXRjaGVyVGV4dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNiZC10aGVtZS10ZXh0JylcclxuICAgIGNvbnN0IGFjdGl2ZVRoZW1lSWNvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy50aGVtZS1pY29uLWFjdGl2ZSB1c2UnKVxyXG4gICAgY29uc3QgYnRuVG9BY3RpdmUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBbZGF0YS1icy10aGVtZS12YWx1ZT1cIiR7dGhlbWV9XCJdYClcclxuICAgIGNvbnN0IHN2Z09mQWN0aXZlQnRuID0gYnRuVG9BY3RpdmUucXVlcnlTZWxlY3Rvcignc3ZnIHVzZScpLmdldEF0dHJpYnV0ZSgnaHJlZicpXHJcblxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtYnMtdGhlbWUtdmFsdWVdJykuZm9yRWFjaChlbGVtZW50ID0+IHtcclxuICAgICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKVxyXG4gICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZSgnYXJpYS1wcmVzc2VkJywgJ2ZhbHNlJylcclxuICAgIH0pXHJcblxyXG4gICAgYnRuVG9BY3RpdmUuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJylcclxuICAgIGJ0blRvQWN0aXZlLnNldEF0dHJpYnV0ZSgnYXJpYS1wcmVzc2VkJywgJ3RydWUnKVxyXG4gICAgYWN0aXZlVGhlbWVJY29uLnNldEF0dHJpYnV0ZSgnaHJlZicsIHN2Z09mQWN0aXZlQnRuKVxyXG4gICAgY29uc3QgdGhlbWVTd2l0Y2hlckxhYmVsID0gYCR7dGhlbWVTd2l0Y2hlclRleHQudGV4dENvbnRlbnR9ICgke2J0blRvQWN0aXZlLmRhdGFzZXQuYnNUaGVtZVZhbHVlfSlgXHJcbiAgICB0aGVtZVN3aXRjaGVyLnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcsIHRoZW1lU3dpdGNoZXJMYWJlbClcclxuXHJcbiAgICBpZiAoZm9jdXMpIHtcclxuICAgICAgdGhlbWVTd2l0Y2hlci5mb2N1cygpXHJcbiAgICB9XHJcbiAgfVxyXG4gICovXHJcblxyXG4gICAgLy8gVXBkYXRlIHRoZW1lIGlmIGJyb3dzZXIvT1Mgc2V0dGluZyBpcyBjaGFuZ2VkXHJcbiAgICB3aW5kb3cubWF0Y2hNZWRpYSgnKHByZWZlcnMtY29sb3Itc2NoZW1lOiBkYXJrKScpLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsICgpID0+IHtcclxuICAgICAgICBpZiAoc3RvcmVkVGhlbWUgIT09ICdsaWdodCcgfHwgc3RvcmVkVGhlbWUgIT09ICdkYXJrJykge1xyXG4gICAgICAgICAgICBzZXRUaGVtZShnZXRQcmVmZXJyZWRUaGVtZSgpKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBFbmFibGUgdGhlbWUgc3dpdGNoaW5nLCBvbiBET01Db250ZW50TG9hZGVkXHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsICgpID0+IHtcclxuICAgICAgICAvLyBzaG93QWN0aXZlVGhlbWUoZ2V0UHJlZmVycmVkVGhlbWUoKSlcclxuXHJcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtYnMtdGhlbWUtdmFsdWVdJykuZm9yRWFjaCgodG9nZ2xlKSA9PiB7XHJcbiAgICAgICAgICAgIHRvZ2dsZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRoZW1lID0gdG9nZ2xlLmdldEF0dHJpYnV0ZSgnZGF0YS1icy10aGVtZS12YWx1ZScpO1xyXG4gICAgICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3RoZW1lJywgdGhlbWUpO1xyXG4gICAgICAgICAgICAgICAgc2V0VGhlbWUodGhlbWUpO1xyXG4gICAgICAgICAgICAgICAgLy8gc2hvd0FjdGl2ZVRoZW1lKHRoZW1lKVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG59KSgpO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiOztBQU9BLEdBQUMsTUFBTTtBQUNIO0FBRUEsVUFBTSxjQUFjLGFBQWEsUUFBUSxPQUFPO0FBR2hELFVBQU0sb0JBQW9CLE1BQU07QUFDNUIsVUFBSSxhQUFhO0FBQ2IsZUFBTztBQUFBLE1BQ1g7QUFFQSxhQUFPLE9BQU8sV0FBVyw4QkFBOEIsRUFBRSxVQUFVLFNBQVM7QUFBQSxJQUNoRjtBQUdBLFVBQU0sV0FBVyxTQUFVLE9BQU87QUFDOUIsVUFBSSxVQUFVLFVBQVUsT0FBTyxXQUFXLDhCQUE4QixFQUFFLFNBQVM7QUFDL0UsaUJBQVMsZ0JBQWdCLGFBQWEsaUJBQWlCLE1BQU07QUFBQSxNQUNqRSxPQUFPO0FBQ0gsaUJBQVMsZ0JBQWdCLGFBQWEsaUJBQWlCLEtBQUs7QUFBQSxNQUNoRTtBQUFBLElBQ0o7QUFFQSxhQUFTLGtCQUFrQixDQUFDO0FBaUM1QixXQUFPLFdBQVcsOEJBQThCLEVBQUUsaUJBQWlCLFVBQVUsTUFBTTtBQUMvRSxVQUFJLGdCQUFnQixXQUFXLGdCQUFnQixRQUFRO0FBQ25ELGlCQUFTLGtCQUFrQixDQUFDO0FBQUEsTUFDaEM7QUFBQSxJQUNKLENBQUM7QUFHRCxXQUFPLGlCQUFpQixvQkFBb0IsTUFBTTtBQUc5QyxlQUFTLGlCQUFpQix1QkFBdUIsRUFBRSxRQUFRLENBQUMsV0FBVztBQUNuRSxlQUFPLGlCQUFpQixTQUFTLE1BQU07QUFDbkMsZ0JBQU0sUUFBUSxPQUFPLGFBQWEscUJBQXFCO0FBQ3ZELHVCQUFhLFFBQVEsU0FBUyxLQUFLO0FBQ25DLG1CQUFTLEtBQUs7QUFBQSxRQUVsQixDQUFDO0FBQUEsTUFDTCxDQUFDO0FBQUEsSUFDTCxDQUFDO0FBQUEsRUFDTCxHQUFHOyIsCiAgIm5hbWVzIjogW10KfQo=
