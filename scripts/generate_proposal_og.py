import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H = 1200, 630
img = Image.new('RGB', (W, H), (20, 16, 13))
draw = ImageDraw.Draw(img)

# 1. Subtle elegant gradient background
for y in range(H):
    ratio = y / H
    r = int(24 - ratio * 10)
    g = int(20 - ratio * 9)
    b = int(16 - ratio * 8)
    draw.line([(0, y), (W, y)], fill=(r, g, b))

# 2. Ambient golden glow circle behind mockup
glow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
glow_draw = ImageDraw.Draw(glow)
glow_draw.ellipse([750, 40, 1250, 560], fill=(245, 208, 97, 35))
glow_draw.ellipse([820, 90, 1180, 510], fill=(245, 208, 97, 45))
glow = glow.filter(ImageFilter.GaussianBlur(60))
img.paste(glow, (0, 0), glow)

# 3. Load smartphone mockup and paste with drop shadow
mockup_path = 'public/images/sowonpray_smartphone_mockup.jpg'
if os.path.exists(mockup_path):
    mock = Image.open(mockup_path).convert('RGBA')
    mw, mh = mock.size
    target_h = 560
    target_w = int(mw * (target_h / mh))
    mock_resized = mock.resize((target_w, target_h), Image.Resampling.LANCZOS)
    
    # Shadow for mockup
    shadow = Image.new('RGBA', (target_w + 60, target_h + 60), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shadow)
    sdraw.rounded_rectangle([30, 30, target_w + 30, target_h + 30], radius=40, fill=(0, 0, 0, 180))
    shadow = shadow.filter(ImageFilter.GaussianBlur(25))
    
    img.paste(shadow, (730 - 30, 35 - 30), shadow)
    img.paste(mock_resized, (730, 35), mock_resized)

# 4. Outer delicate gold frame
draw.rectangle([18, 18, W - 18, H - 18], outline=(197, 155, 39), width=1)
draw.rectangle([24, 24, W - 24, H - 24], outline=(120, 95, 25), width=1)

# 5. Fonts
font_title1 = ImageFont.truetype('C:/Windows/Fonts/malgunbd.ttf', 38)
font_title2 = ImageFont.truetype('C:/Windows/Fonts/malgunbd.ttf', 48)
font_badge = ImageFont.truetype('C:/Windows/Fonts/malgunbd.ttf', 17)
font_sub = ImageFont.truetype('C:/Windows/Fonts/malgunbd.ttf', 21)
font_item = ImageFont.truetype('C:/Windows/Fonts/malgun.ttf', 19)
font_foot = ImageFont.truetype('C:/Windows/Fonts/malgunbd.ttf', 16)

# 6. Badge
badge_text = '대한불교 조계종 제주 소원사 · 제주AI파트너'
bx, by = 60, 52
bw = int(draw.textlength(badge_text, font=font_badge)) + 30
bh = 34
draw.rounded_rectangle([bx, by, bx + bw, by + bh], radius=17, fill=(45, 35, 25), outline=(245, 208, 97), width=1)
draw.text((bx + 15, by + 6), badge_text, fill=(245, 208, 97), font=font_badge)

# 7. Main Title
draw.text((60, 108), '차세대 사찰 모바일법당 &', fill=(255, 255, 255), font=font_title1)
draw.text((60, 160), '스마트 종무 ERP 도입 제안서', fill=(245, 208, 97), font=font_title2)

# 8. Divider line
draw.line([(60, 235), (680, 235)], fill=(197, 155, 39), width=2)

# 9. Subtitle
draw.text((60, 252), '"내 손안의 도량, 천년의 불심을 스마트폰으로"', fill=(232, 223, 213), font=font_sub)

# 10. Key Points (4 items)
items = [
    '24시간 스마트폰 소원등 켜기 & 실시간 기도 접수',
    '만세력 필요 없는 AI 사주간지 1초 자동 변환',
    '대웅전 축원 명패 1초 즉시 출력 & 실시간 종무 ERP',
    '포교 인연 리워드 & 전국 사찰 B2B 맞춤형 도량 구축'
]

iy = 302
for text in items:
    # background pill
    draw.rounded_rectangle([60, iy, 680, iy + 44], radius=10, fill=(32, 26, 21), outline=(80, 65, 45), width=1)
    # gold dot
    draw.ellipse([78, iy + 16, 90, iy + 28], fill=(245, 208, 97))
    draw.text((105, iy + 10), text, fill=(240, 235, 225), font=font_item)
    iy += 54

# 11. Footer URL
draw.text((60, 545), '도입 제안서 보기 : https://sowonpray.vercel.app/proposal', fill=(197, 155, 39), font=font_foot)

# Save to public/images and artifact directory
out_public = 'public/images/sowonpray_proposal_og.jpg'
out_dist = 'dist/images/sowonpray_proposal_og.jpg'
out_artifact = 'C:/Users/user/.gemini/antigravity/brain/624efb18-c0aa-4493-ae34-0cb1ba2c2612/proposal_thumbnail_preview.jpg'

os.makedirs('public/images', exist_ok=True)
os.makedirs('dist/images', exist_ok=True)

img.save(out_public, quality=95)
img.save(out_dist, quality=95)
img.save(out_artifact, quality=95)
print('Successfully created sowonpray_proposal_og.jpg!')
