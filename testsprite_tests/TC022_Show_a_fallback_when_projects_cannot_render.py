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
        
        # -> Click the 'SEE WORK' button in the hero to open the Projects section and check whether a projects fallback message or the projects list is displayed.
        # SEE WORK button
        elem = page.get_by_role('button', name='SEE WORK', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Verify the page renders a fallback state for the projects section
        # Assert: Expected the project's GitHub link to be hidden as part of the projects fallback state.
        await expect(page.locator("xpath=/html/body/div[1]/div[2]/div/section[3]/div/div/div[2]/div[1]/div[3]/div[1]/div/div[2]/a[1]").nth(0)).not_to_be_visible(timeout=15000), "Expected the project's GitHub link to be hidden as part of the projects fallback state."
        # Assert: Expected the project tag 'Next.js' to be hidden as part of the projects fallback state.
        await expect(page.locator("xpath=/html/body/div[1]/div[2]/div/section[3]/div/div/div[2]/div[1]/div[3]/div[2]/div/span[1]").nth(0)).not_to_be_visible(timeout=15000), "Expected the project tag 'Next.js' to be hidden as part of the projects fallback state."
        # Assert: Expected the project tag 'React' to be hidden as part of the projects fallback state.
        await expect(page.locator("xpath=/html/body/div[1]/div[2]/div/section[3]/div/div/div[2]/div[6]/div[3]/div[2]/div/span[1]").nth(0)).not_to_be_visible(timeout=15000), "Expected the project tag 'React' to be hidden as part of the projects fallback state."
        # Assert: Expected the project's Live Demo link to be hidden as part of the projects fallback state.
        await expect(page.locator("xpath=/html/body/div[1]/div[2]/div/section[3]/div/div/div[2]/div[1]/div[3]/div[1]/div/div[2]/a[2]").nth(0)).not_to_be_visible(timeout=15000), "Expected the project's Live Demo link to be hidden as part of the projects fallback state."
        
        # --> Verify the other main portfolio sections are still displayed
        await page.locator("xpath=/html/body/div[1]/div[2]/header/div/nav/button[1]").nth(0).scroll_into_view_if_needed()
        # Assert: Expected the 'HOME' navigation button to be visible.
        await expect(page.locator("xpath=/html/body/div[1]/div[2]/header/div/nav/button[1]").nth(0)).to_be_visible(timeout=15000), "Expected the 'HOME' navigation button to be visible."
        await page.locator("xpath=/html/body/div[1]/div[2]/header/div/nav/button[2]").nth(0).scroll_into_view_if_needed()
        # Assert: Expected the 'ABOUT' navigation button to be visible.
        await expect(page.locator("xpath=/html/body/div[1]/div[2]/header/div/nav/button[2]").nth(0)).to_be_visible(timeout=15000), "Expected the 'ABOUT' navigation button to be visible."
        await page.locator("xpath=/html/body/div[1]/div[2]/header/div/nav/button[3]").nth(0).scroll_into_view_if_needed()
        # Assert: Expected the 'SKILLS' navigation button to be visible.
        await expect(page.locator("xpath=/html/body/div[1]/div[2]/header/div/nav/button[3]").nth(0)).to_be_visible(timeout=15000), "Expected the 'SKILLS' navigation button to be visible."
        await page.locator("xpath=/html/body/div[1]/div[2]/header/div/nav/button[4]").nth(0).scroll_into_view_if_needed()
        # Assert: Expected the 'CONTACT' navigation button to be visible.
        await expect(page.locator("xpath=/html/body/div[1]/div[2]/header/div/nav/button[4]").nth(0)).to_be_visible(timeout=15000), "Expected the 'CONTACT' navigation button to be visible."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    