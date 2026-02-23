#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generate ASCA PWA Horse Logo & PNG Assets
Creates SVG logo + exports to multiple sizes with maskable variants
Brand colors: Forest Green (#1f6b3a), Cream (#f7f3ea)
"""

import os
import sys
import xml.etree.ElementTree as ET
from pathlib import Path
from PIL import Image, ImageDraw
import io

# Fix encoding for Windows console
if sys.stdout.encoding != 'utf-8':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Brand colors
FOREST_GREEN = "#1f6b3a"
CREAM = "#f7f3ea"
WHITE = "#ffffff"

# Directories
PROJECT_ROOT = Path(__file__).parent.parent
PUBLIC_DIR = PROJECT_ROOT / "public"
ICONS_DIR = PUBLIC_DIR / "icons"
ICONS_DIR.mkdir(parents=True, exist_ok=True)

print("[*] ASCA PWA Logo Generator")
print("=" * 50)

# ============================================================================
# 1. CREATE SVG HORSE LOGO
# ============================================================================

def create_horse_svg(width=500, height=500):
    """Create a vector-style horse head logo in SVG format."""
    
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}">
  <!-- Background circle (optional for PWA icon) -->
  <circle cx="{width/2}" cy="{height/2}" r="{width/2}" fill="{CREAM}" opacity="0.05"/>
  
  <!-- Horse Head Main Shape -->
  <g transform="translate({width/2}, {height/2})">
    <!-- Ear 1 (left) -->
    <ellipse cx="-45" cy="-80" rx="18" ry="55" fill="{FOREST_GREEN}" opacity="0.9" transform="rotate(-20 -45 -80)"/>
    <ellipse cx="-45" cy="-75" rx="10" ry="35" fill="{CREAM}" transform="rotate(-20 -45 -75)"/>
    
    <!-- Ear 2 (right) -->
    <ellipse cx="45" cy="-80" rx="18" ry="55" fill="{FOREST_GREEN}" opacity="0.9" transform="rotate(20 45 -80)"/>
    <ellipse cx="45" cy="-75" rx="10" ry="35" fill="{CREAM}" transform="rotate(20 45 -75)"/>
    
    <!-- Mane -->
    <path d="M -30,-70 Q -25,-40 -20,-10 Q -18,20 -15,40" 
          stroke="{FOREST_GREEN}" stroke-width="16" fill="none" stroke-linecap="round" opacity="0.85"/>
    <path d="M 0,-95 Q 5,-50 8,-10 Q 10,25 12,50" 
          stroke="{FOREST_GREEN}" stroke-width="14" fill="none" stroke-linecap="round" opacity="0.9"/>
    <path d="M 30,-70 Q 28,-40 25,-10 Q 23,20 20,40" 
          stroke="{FOREST_GREEN}" stroke-width="14" fill="none" stroke-linecap="round" opacity="0.8"/>
    
    <!-- Head main shape -->
    <path d="M -50,-50 Q -65,-30 -68,10 L -60,45 L -20,55 L 20,55 L 60,45 Q 65,10 50,-50 Q 0,-100 -50,-50 Z" 
          fill="{FOREST_GREEN}"/>
    
    <!-- Face lighter shade -->
    <path d="M -45,-35 Q -55,-20 -58,5 L -52,35 L -10,42 L 10,42 L 52,35 Q 55,5 45,-35 Q 0,-75 -45,-35 Z" 
          fill="{FOREST_GREEN}" opacity="0.95"/>
    
    <!-- Snout -->
    <ellipse cx="0" cy="40" rx="22" ry="18" fill="{CREAM}" opacity="0.3"/>
    
    <!-- Nostril 1 -->
    <ellipse cx="-12" cy="42" rx="6" ry="5" fill="{FOREST_GREEN}" opacity="0.7"/>
    
    <!-- Nostril 2 -->
    <ellipse cx="12" cy="42" rx="6" ry="5" fill="{FOREST_GREEN}" opacity="0.7"/>
    
    <!-- Eye white -->
    <circle cx="-25" cy="-15" r="12" fill="{WHITE}"/>
    
    <!-- Eye iris -->
    <circle cx="-25" cy="-15" r="8" fill="{FOREST_GREEN}"/>
    
    <!-- Eye pupil -->
    <circle cx="-23" cy="-17" r="4" fill="black"/>
    
    <!-- Eye shine -->
    <circle cx="-22" cy="-18" r="2" fill="white"/>
    
    <!-- Neck/shoulder transition -->
    <path d="M -35,50 Q -50,70 -45,95 L 45,95 Q 50,70 35,50 Z" 
          fill="{FOREST_GREEN}" opacity="0.85"/>
    
    <!-- Muzzle definition -->
    <line x1="-20" y1="35" x2="-15" y2="48" stroke="{FOREST_GREEN}" stroke-width="2" opacity="0.6"/>
    <line x1="20" y1="35" x2="15" y2="48" stroke="{FOREST_GREEN}" stroke-width="2" opacity="0.6"/>
  </g>
</svg>'''
    
    return svg

# Save SVG
svg_content = create_horse_svg(500, 500)
svg_path = ICONS_DIR / "horse-logo.svg"
with open(svg_path, 'w') as f:
    f.write(svg_content)
print(f"[+] Created SVG: {svg_path}")

# ============================================================================
# 2. CONVERT SVG TO PIL IMAGE
# ============================================================================

def svg_to_png(svg_string, size=512):
    """Convert SVG to PNG using PIL (simple rasterization)."""
    # Use cairosvg if available, else fallback to PIL rendering
    try:
        import cairosvg
        png_bytes = cairosvg.svg2png(bytestring=svg_string.encode('utf-8'), output_width=size, output_height=size)
        return Image.open(io.BytesIO(png_bytes))
    except ImportError:
        # Fallback: render SVG with PIL approximation
        return render_svg_with_pil(size)

def render_svg_with_pil(size=512):
    """Render horse logo programmatically with PIL."""
    img = Image.new('RGBA', (size, size), (247, 243, 234, 0))  # Cream background, transparent
    draw = ImageDraw.Draw(img)
    
    # Scale factor
    scale = size / 500
    
    # Colors (RGB)
    forest_green = (31, 107, 58)  # #1f6b3a
    cream = (247, 243, 234)        # #f7f3ea
    
    # Offsets (center the horse)
    cx, cy = size / 2, size / 2
    
    # Ears
    ear_size = int(30 * scale)
    draw.ellipse(
        [cx - 60*scale - ear_size/2, cy - 100*scale - ear_size, 
         cx - 60*scale + ear_size/2, cy - 100*scale + ear_size],
        fill=forest_green
    )
    draw.ellipse(
        [cx + 60*scale - ear_size/2, cy - 100*scale - ear_size,
         cx + 60*scale + ear_size/2, cy - 100*scale + ear_size],
        fill=forest_green
    )
    
    # Head (main ellipse)
    head_width = int(120 * scale)
    head_height = int(140 * scale)
    draw.ellipse(
        [cx - head_width/2, cy - head_height/2,
         cx + head_width/2, cy + head_height/2],
        fill=forest_green
    )
    
    # Snout
    snout_size = int(40 * scale)
    draw.ellipse(
        [cx - snout_size/2, cy + 50*scale - snout_size/2,
         cx + snout_size/2, cy + 50*scale + snout_size/2],
        fill=cream, outline=forest_green, width=int(2*scale)
    )
    
    # Nostrils
    nostril_size = int(10 * scale)
    draw.ellipse(
        [cx - 20*scale - nostril_size/2, cy + 55*scale - nostril_size/2,
         cx - 20*scale + nostril_size/2, cy + 55*scale + nostril_size/2],
        fill=forest_green
    )
    draw.ellipse(
        [cx + 20*scale - nostril_size/2, cy + 55*scale - nostril_size/2,
         cx + 20*scale + nostril_size/2, cy + 55*scale + nostril_size/2],
        fill=forest_green
    )
    
    # Eye white
    eye_white_size = int(18 * scale)
    draw.ellipse(
        [cx - 45*scale - eye_white_size/2, cy - 20*scale - eye_white_size/2,
         cx - 45*scale + eye_white_size/2, cy - 20*scale + eye_white_size/2],
        fill=(255, 255, 255)
    )
    
    # Eye iris
    eye_iris_size = int(12 * scale)
    draw.ellipse(
        [cx - 45*scale - eye_iris_size/2, cy - 20*scale - eye_iris_size/2,
         cx - 45*scale + eye_iris_size/2, cy - 20*scale + eye_iris_size/2],
        fill=forest_green
    )
    
    # Eye pupil
    pupil_size = int(6 * scale)
    draw.ellipse(
        [cx - 42*scale - pupil_size/2, cy - 22*scale - pupil_size/2,
         cx - 42*scale + pupil_size/2, cy - 22*scale + pupil_size/2],
        fill=(0, 0, 0)
    )
    
    # Mane (curved lines)
    mane_width = int(8 * scale)
    draw.line([(cx - 30*scale, cy - 90*scale), (cx - 30*scale, cy + 40*scale)], 
              fill=forest_green, width=mane_width)
    draw.line([(cx, cy - 110*scale), (cx, cy + 50*scale)], 
              fill=forest_green, width=mane_width)
    draw.line([(cx + 30*scale, cy - 90*scale), (cx + 30*scale, cy + 40*scale)], 
              fill=forest_green, width=mane_width)
    
    # Neck
    draw.polygon(
        [(cx - 50*scale, cy + 60*scale),
         (cx + 50*scale, cy + 60*scale),
         (cx + 45*scale, cy + 110*scale),
         (cx - 45*scale, cy + 110*scale)],
        fill=forest_green
    )
    
    return img

# ============================================================================
# 3. GENERATE PNG ASSETS
# ============================================================================

sizes = {
    'icon-192.png': 192,
    'icon-512.png': 512,
    'shortcut-events-96.png': 96,
}

print("\n[PNG] Generating PNG assets...")

for filename, size in sizes.items():
    try:
        # Try cairosvg first for better quality
        import cairosvg
        png_bytes = cairosvg.svg2png(bytestring=svg_content.encode('utf-8'), 
                                    output_width=size, output_height=size)
        img = Image.open(io.BytesIO(png_bytes))
    except:
        # Fallback to PIL rendering
        img = render_svg_with_pil(size)
    
    # Save PNG
    png_path = ICONS_DIR / filename
    img.save(png_path, 'PNG')
    print(f"  [+] {filename} ({size}x{size})")

# ============================================================================
# 4. CREATE MASKABLE VARIANTS (PWA)
# ============================================================================

print("\n[MASK] Generating maskable variants...")

for base_filename, size in [('icon-192', 192), ('icon-512', 512)]:
    try:
        import cairosvg
        png_bytes = cairosvg.svg2png(bytestring=svg_content.encode('utf-8'),
                                    output_width=size, output_height=size)
        img = Image.open(io.BytesIO(png_bytes))
    except:
        img = render_svg_with_pil(size)
    
    # Maskable variant: add padding to ensure content stays in safe zone
    # PWA maskable icons should have content within 80% of the viewport
    padded = Image.new('RGBA', (size, size), (247, 243, 234, 0))
    offset = int(size * 0.1)  # 10% padding
    padded.paste(img, (offset, offset), img)
    
    maskable_path = ICONS_DIR / f"{base_filename}-maskable.png"
    padded.save(maskable_path, 'PNG')
    print(f"  [+] {base_filename}-maskable.png ({size}x{size})")

# ============================================================================
# 5. CREATE SCREENSHOTS (for manifest)
# ============================================================================

print("\n[SS] Generating screenshots...")

def create_screenshot(width, height, filepath):
    """Create app screenshot showing UI mockup."""
    img = Image.new('RGBA', (width, height), (247, 243, 234, 255))
    draw = ImageDraw.Draw(img)
    
    forest_green = (31, 107, 58)
    cream = (247, 243, 234)
    
    # Header bar
    draw.rectangle([(0, 0), (width, int(height * 0.15))], fill=forest_green)
    
    # Logo area
    draw.text((int(width * 0.05), int(height * 0.02)), "ASCA", fill=cream)
    
    # Main content area with horse logo
    try:
        import cairosvg
        png_bytes = cairosvg.svg2png(bytestring=svg_content.encode('utf-8'),
                                    output_width=int(width*0.4), output_height=int(width*0.4))
        logo = Image.open(io.BytesIO(png_bytes))
    except:
        logo = render_svg_with_pil(int(width * 0.4))
    
    logo_x = int((width - logo.width) / 2)
    logo_y = int(height * 0.25)
    img.paste(logo, (logo_x, logo_y), logo)
    
    # Text below logo
    draw.text((int(width * 0.1), int(height * 0.65)), 
              "Atlanta Saddle Club", fill=forest_green)
    draw.text((int(width * 0.1), int(height * 0.72)),
              "Equestrian Community", fill=forest_green)
    
    # Action buttons
    button_width = int(width * 0.35)
    button_height = int(height * 0.08)
    button_y = int(height * 0.82)
    
    # Button 1
    draw.rectangle(
        [(int(width * 0.075), button_y),
         (int(width * 0.075) + button_width, button_y + button_height)],
        fill=forest_green
    )
    
    # Button 2
    draw.rectangle(
        [(int(width * 0.575), button_y),
         (int(width * 0.575) + button_width, button_y + button_height)],
        fill=forest_green
    )
    
    img.save(filepath, 'PNG')
    filename = Path(filepath).name
    print(f"  [+] {filename} ({width}x{height})")

# Create narrow & wide screenshots
screenshot_dir = PUBLIC_DIR / "screenshots"
screenshot_dir.mkdir(exist_ok=True)

create_screenshot(540, 720, str(screenshot_dir / "narrow.png"))
create_screenshot(1280, 720, str(screenshot_dir / "wide.png"))

# ============================================================================
# 6. SUMMARY
# ============================================================================

print("\n" + "=" * 50)
print("[OK] LOGO GENERATION COMPLETE")
print("=" * 50)
print(f"\nAssets created in: {ICONS_DIR}/")
print(f"Screenshots in: {screenshot_dir}/")

print("\nFiles generated:")
print("  * horse-logo.svg (source)")
print("  * icon-192.png")
print("  * icon-192-maskable.png")
print("  * icon-512.png")
print("  * icon-512-maskable.png")
print("  * shortcut-events-96.png")
print("  * screenshots/narrow.png")
print("  * screenshots/wide.png")

print("\nNext steps:")
print("  1. Review logo: open public/icons/horse-logo.svg")
print("  2. Check PNGs look good (no artifacts)")
print("  3. Update manifest.json with paths (already configured)")
print("  4. Test PWA install with new icons")
print("  5. Run Lighthouse audit")

print("\nBrand colors used:")
print(f"  Forest Green: {FOREST_GREEN}")
print(f"  Cream: {CREAM}")
