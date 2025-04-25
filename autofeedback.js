(async function () {
  async function waitForElement(selectorFn, timeout = 10000, interval = 200) {
    const startTime = Date.now();
    return new Promise((resolve, reject) => {
      const check = () => {
        const result = selectorFn();
        if (result) return resolve(result);
        if (Date.now() - startTime > timeout) return reject('Timeout waiting for element');
        setTimeout(check, interval);
      };
      check();
    });
  }

  async function getEJ2Dropdowns(innerDoc) {
    return Array.from(innerDoc.querySelectorAll('input.e-dropdownlist'));
  }

  async function autoFillAndSubmitFeedback(innerDoc) {
    try {
      console.log('[AutoFeedback] Starting automation sequence...');
      const allRadios = innerDoc.querySelectorAll('input[type="radio"]');
      const filledNames = new Set();
  
      allRadios.forEach(radio => {
        const { name, value } = radio;
        if (value === '7' && !filledNames.has(name)) {
          radio.checked = true;
          filledNames.add(name);
  
          // Trigger change event
          setTimeout(() => {
            const changeEvent = new Event('change', { bubbles: true });
            radio.dispatchEvent(changeEvent);
          }, 0);
  
          // Add checked class
          const parentSpan = radio.parentElement;
          if (parentSpan?.tagName.toLowerCase() === 'span') {
            parentSpan.classList.add('checked');
          }
  
          console.log(`[AutoFeedback] Selected -> Name: ${name}, ID: ${radio.id}, Value: ${value}`);
        }
      });
  
      // ✅ Optional: auto-submit
      const submitSpan = innerDoc.querySelector('span[title="Submit"]');
      if (submitSpan) {
        const submitAnchor = submitSpan.querySelector('a');
        if (submitAnchor) {
          console.log('[AutoFeedback] Clicking submit...');
          submitAnchor.click();
          
          // Optional: disable to prevent double clicks
          submitAnchor.setAttribute('disabled', 'disabled');
          submitAnchor.style.pointerEvents = 'none';
          submitAnchor.style.opacity = '0.5';
        } else {
          console.warn('[AutoFeedback] Submit <a> not found.');
        }
      } else {
        console.warn('[AutoFeedback] Submit span not found.');
      }
  
    } catch (err) {
      console.error('[AutoFeedback] Error during automation:', err);
    }
  }
  

  async function runDropdownAutomation() {
    try {
      console.log('[Automation] Starting...');

      const iframe = await waitForElement(() => document.querySelector('#ifmPortalInfrastturcture'), 15000);
      const innerDoc = iframe.contentDocument || iframe.contentWindow.document;
      console.log('[Automation] Iframe loaded');

      let dropdowns = await getEJ2Dropdowns(innerDoc);
      if (dropdowns.length < 2) throw '[Automation] Less than 2 dropdowns found';
      console.log('[Automation] Dropdowns found:', dropdowns.length);

      // === Dropdown 1 ===
      let dropdown1ItemsLength = 0;

      try {
        const dropdown1 = dropdowns[0];
        const instance1 = dropdown1?.ej2_instances?.[0];
        if (!instance1) throw '[Dropdown 1] EJ2 instance not found';

        instance1.showPopup();

        const popupId1 = dropdown1.id + '_popup';
        const items1 = await waitForElement(() => {
          const items = innerDoc.querySelectorAll(`#${popupId1} ul.e-list-parent > li.e-list-item`);
          return items.length >= 1 && items;
        }, 10000);

        dropdown1ItemsLength = items1.length;
        if (dropdown1ItemsLength <= 1) {
          console.log('[Automation] Only one item left in Dropdown 1. Stopping automation.');
          return false; // signal to stop loop
        }

        items1[1]?.click();
        console.log('[Dropdown 1] Selected:', items1[1]?.textContent);
      } catch (err) {
        console.warn('[Dropdown 1] Selection failed, proceeding anyway:', err);
      }

      await new Promise(res => setTimeout(res, 1500));
      dropdowns = await getEJ2Dropdowns(innerDoc);

      // === Dropdown 2 ===
      try {
        const dropdown2 = dropdowns[1];
        const instance2 = dropdown2?.ej2_instances?.[0];
        if (!instance2) throw '[Dropdown 2] EJ2 instance not found';

        instance2.showPopup();

        const popupId2 = dropdown2.id + '_popup';
        const items2 = await waitForElement(() => {
          const items = innerDoc.querySelectorAll(`#${popupId2} ul.e-list-parent > li.e-list-item`);
          return items.length >= 2 && items;
        }, 10000);

        items2[1].click();
        console.log('[Dropdown 2] Selected:', items2[1].textContent);
      } catch (err) {
        console.error('[Dropdown 2] Error:', err);
        return false;
      }

      await new Promise(res => setTimeout(res, 3000));
      await autoFillAndSubmitFeedback(innerDoc);

      console.log('[Automation] Completed.');
      return true;
    } catch (err) {
      console.error('[Automation Error]', err);
      return false;
    }
  }

  // 🔁 Loop until dropdown1 item length is 1
  let keepRunning = true;
  while (keepRunning) {
    keepRunning = await runDropdownAutomation();
    await new Promise(res => setTimeout(res, 5000)); // short delay between runs
  }

  console.log('[Automation] All entries completed.');
})();
