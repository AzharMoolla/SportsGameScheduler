import { expect, test } from '@playwright/test'

test('broadcast scene keeps its depth and idle lighting in both surfaces',async ({page},testInfo)=>{
  await page.addInitScript(()=>localStorage.setItem('mp.onboarded','1'))
  if(testInfo.project.name.startsWith('desktop')) await page.setViewportSize({width:1920,height:1080})
  await page.emulateMedia({reducedMotion:'no-preference'})
  await page.goto('/')
  await expect(page.getByRole('heading',{level:1})).toBeVisible()
  await expect(page.locator('.field-atlas')).toHaveCount(0)
  const scene=page.locator('.broadcast-air')
  const art=page.locator('.ambient-broadcast-art')
  await expect(scene).toHaveCSS('position','fixed')
  await expect(art).toHaveAttribute('aria-hidden','true')
  await expect(art).toHaveCSS('pointer-events','none')
  const decal=page.locator('.ambient-decal-a').first()
  const time=await decal.evaluate(el=>el.getAnimations()[0]?.currentTime as number)
  await expect.poll(()=>decal.evaluate(el=>el.getAnimations()[0]?.currentTime as number)).toBeGreaterThan(time)
  const original=(await scene.boundingBox())!.y
  await expect.poll(()=>page.evaluate(()=>{window.scrollTo(0,500);return scrollY})).toBeGreaterThan(300)
  expect((await scene.boundingBox())!.y).toBe(original)
  for(const mode of ['broadcast','program']){
    const toggle=page.getByRole('button',{name:mode==='broadcast'?'Switch to Broadcast Dark':'Switch to Program Light',exact:true})
    if(await toggle.isVisible()) await toggle.click()
    await expect(scene).toHaveCSS('opacity','1')
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy()
    await page.screenshot({path:`docs/design-review/background-motion/${mode}-${testInfo.project.name}.png`})
  }
  await page.emulateMedia({reducedMotion:'reduce'})
  await expect(decal).toHaveCSS('animation-name','none')
  await expect(page.locator('.ambient-travel').first()).toHaveCSS('display','none')
})
