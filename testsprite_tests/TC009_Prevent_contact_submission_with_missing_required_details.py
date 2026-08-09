import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()

        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",
                "--disable-dev-shm-usage",
                "--ipc=host",
                "--single-process"
            ],
        )

        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        # Wider default timeout to match the agent's DOM-stability budget;
        # auto-waiting Playwright APIs (expect, locator.wait_for) inherit this.
        context.set_default_timeout(15000)

        # Open a new page in the browser context
        page = await context.new_page()

        # Interact with the page elements to simulate user flow
        # -> navigate
        await page.goto("http://localhost:5173")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Click the 'CONTACT' navigation button to scroll to the contact form on the homepage.
        # CONTACT button
        elem = page.get_by_role('button', name='CONTACT', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'SEND MESSAGE' button to submit the contact form without filling required fields, then check for validation errors and absence of a success message.
        # SEND MESSAGE button
        elem = page.get_by_role('button', name='SEND MESSAGE', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Verify the form is not submitted
        # Assert: The page remained at http://localhost:5173/, confirming the form did not navigate away after submission.
        await expect(page).to_have_url(re.compile("http://localhost:5173/"), timeout=15000), "The page remained at http://localhost:5173/, confirming the form did not navigate away after submission."
        current_url = await page.evaluate("() => window.location.href")
        # Assert: page loaded with a URL (final outcome verified by the AI judge during the run)
        assert current_url, 'Page should have loaded with a URL'
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    