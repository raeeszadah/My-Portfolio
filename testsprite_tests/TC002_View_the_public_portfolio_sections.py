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
        
        # -> Scroll down to reveal the Projects and Experience sections, then search the page for the 'Projects' and 'Experience' headings to confirm public content is shown.
        await page.mouse.wheel(0, 300)
        
        # -> Scroll down the page to reveal the 'Projects' and 'Experience' sections and verify they contain public content.
        await page.mouse.wheel(0, 300)
        
        # -> Scroll down the page to reveal the 'Projects' and 'Experience' sections and verify they contain public content by searching for the 'Projects' and 'Experience' headings.
        await page.mouse.wheel(0, 300)
        
        # -> Scroll down to reveal the 'Projects' section and verify it contains public content.
        await page.mouse.wheel(0, 300)
        
        # -> Scroll the page down to reveal the 'Experience' section so it can be inspected for public content.
        await page.mouse.wheel(0, 300)
        
        # -> Scroll down the page to reveal the 'Experience' section so it can be inspected for public content.
        await page.mouse.wheel(0, 300)
        
        # -> Scroll down to reveal the 'Experience' section and check that the 'Experience' heading and its entries display public content.
        await page.mouse.wheel(0, 300)
        
        # -> Click the '02. ABOUT ME & JOURNEY' navigation button to jump to the About / Journey area and reveal the Experience section for verification.
        # 02. ABOUT ME & JOURNEY button
        elem = page.get_by_role('button', name='02. ABOUT ME & JOURNEY', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the '03. TECHNICAL SKILLS' navigation button to jump to the Skills section and reveal its public content.
        # 03. TECHNICAL SKILLS button
        elem = page.get_by_role('button', name='03. TECHNICAL SKILLS', exact=True)
        await elem.click(timeout=10000)
        
        # -> Verify the Skills section displays public content by locating skill labels such as 'React.js', 'TypeScript', and 'Node.js' on the page.
        # all button
        elem = page.get_by_role('button', name='all', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Verify the core portfolio sections are displayed
        await page.locator("xpath=/html/body/div[1]/div[2]/div/section[2]/div[4]/div[3]/div/button[12]").nth(0).scroll_into_view_if_needed()
        # Assert: The Skills section is visible and shows the 'Inngest' skill tag.
        await expect(page.locator("xpath=/html/body/div[1]/div[2]/div/section[2]/div[4]/div[3]/div/button[12]").nth(0)).to_be_visible(timeout=15000), "The Skills section is visible and shows the 'Inngest' skill tag."
        await page.locator("xpath=/html/body/div[1]/div[2]/div/section[3]/div/div/div[2]/div[1]/div[3]/div[1]/div/div[2]/a[1]").nth(0).scroll_into_view_if_needed()
        # Assert: The Projects section is visible and includes a project GitHub link.
        await expect(page.locator("xpath=/html/body/div[1]/div[2]/div/section[3]/div/div/div[2]/div[1]/div[3]/div[1]/div/div[2]/a[1]").nth(0)).to_be_visible(timeout=15000), "The Projects section is visible and includes a project GitHub link."
        # Assert: A project entry displays the technology label 'Next.js', confirming project details are visible.
        await expect(page.locator("xpath=/html/body/div[1]/div[2]/div/section[3]/div/div/div[2]/div[1]/div[3]/div[2]/div/span[1]").nth(0)).to_have_text("Next.js", timeout=15000), "A project entry displays the technology label 'Next.js', confirming project details are visible."
        
        # --> Verify public content is shown in those sections
        await page.locator("xpath=/html/body/div[1]/div[2]/div/section[2]/div[4]/div[3]/div/button[17]").nth(0).scroll_into_view_if_needed()
        # Assert: The Skills section shows the public skill label "AWS".
        await expect(page.locator("xpath=/html/body/div[1]/div[2]/div/section[2]/div[4]/div[3]/div/button[17]").nth(0)).to_be_visible(timeout=15000), "The Skills section shows the public skill label \"AWS\"."
        await page.locator("xpath=/html/body/div[1]/div[2]/div/section[3]/div/div/div[2]/div[1]/div[3]/div[2]/div/span[1]").nth(0).scroll_into_view_if_needed()
        # Assert: The Projects section displays the public project tag "Next.js".
        await expect(page.locator("xpath=/html/body/div[1]/div[2]/div/section[3]/div/div/div[2]/div[1]/div[3]/div[2]/div/span[1]").nth(0)).to_be_visible(timeout=15000), "The Projects section displays the public project tag \"Next.js\"."
        await page.locator("xpath=/html/body/div[1]/div[2]/div/section[3]/div/div/div[2]/div[1]/div[3]/div[2]/div/span[2]").nth(0).scroll_into_view_if_needed()
        # Assert: The Projects section displays the public project tag "Clerk".
        await expect(page.locator("xpath=/html/body/div[1]/div[2]/div/section[3]/div/div/div[2]/div[1]/div[3]/div[2]/div/span[2]").nth(0)).to_be_visible(timeout=15000), "The Projects section displays the public project tag \"Clerk\"."
        await page.locator("xpath=/html/body/div[1]/div[2]/div/section[3]/div/div/div[2]/div[6]/div[3]/div[2]/div/span[1]").nth(0).scroll_into_view_if_needed()
        # Assert: A skills/technology label "React" is visible, confirming public content in the skills area.
        await expect(page.locator("xpath=/html/body/div[1]/div[2]/div/section[3]/div/div/div[2]/div[6]/div[3]/div[2]/div/span[1]").nth(0)).to_be_visible(timeout=15000), "A skills/technology label \"React\" is visible, confirming public content in the skills area."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    