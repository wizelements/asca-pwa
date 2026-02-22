#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generate PWA icon assets for ASCA app
Creates PNG icons with ASCA branding (forest green + cream)
"""

from PIL import Image, ImageDraw, ImageFont
import os
import sys
import io

# Force UTF-8 output
if sys.stdout.encoding != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Brand colors
FOREST_GREEN = '#1f6b3a'
CREAM = '#f7f3ea'
ACCENT = '#d4a574'

def hex_to_rgb(hex_color):
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def create_base_icon(size, label=""):
    """Create a base icon with forest green background and cream text"""
    img = Image.new('RGBA', (size, size), hex_to_rgb(FOREST_GREEN))
    draw = ImageDraw.Draw(img)
    
    # Add label text if provided
    if label:
        try:
            # Try to use a better font, fall back to default
            font_size = int(size * 0.4)
            font = ImageFont.load_default()
        except:
            font = ImageFont.load_default()
        
        # Center text
        text_color = hex_to_rgb(CREAM)
        bbox = draw.textbbox((0, 0), label, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        x = (size - text_width) // 2
        y = (size - text_height) // 2
        draw.text((x, y), label, fill=text_color, font=font)
    
    return img

def create_maskable_icon(size):
    """Create a maskable icon (safe area in center)"""
    img = Image.new('RGBA', (size, size), hex_to_rgb(FOREST_GREEN))
    draw = ImageDraw.Draw(img)
    
    # Create a circle in safe area (inner ~80% of canvas for maskable icons)
    safe_area = int(size * 0.8)
    margin = (size - safe_area) // 2
    
    # Draw circle
    bbox = [margin, margin, margin + safe_area, margin + safe_area]
    draw.ellipse(bbox, fill=hex_to_rgb(ACCENT), outline=hex_to_rgb(CREAM), width=2)
    
    return img

def create_screenshot(width, height, label=""):
    """Create app screenshot"""
    img = Image.new('RGB', (width, height), hex_to_rgb(CREAM))
    draw = ImageDraw.Draw(img)
    
    # Header bar
    header_height = int(height * 0.1)
    draw.rectangle([(0, 0), (width, header_height)], fill=hex_to_rgb(FOREST_GREEN))
    
    # Add title
    try:
        font = ImageFont.load_default()
    except:
        font = ImageFont.load_default()
    
    draw.text((20, 10), "ASCA", fill=hex_to_rgb(CREAM), font=font)
    
    # Content area with some decorative elements
    card_margin = int(width * 0.05)
    card_height = int(height * 0.15)
    y_offset = header_height + card_margin
    
    for i in range(3):
        y_pos = y_offset + (i * (card_height + card_margin))
        if y_pos + card_height < height:
            draw.rectangle(
                [(card_margin, y_pos), (width - card_margin, y_pos + card_height)],
                fill=hex_to_rgb(FOREST_GREEN),
                outline=hex_to_rgb(ACCENT),
                width=2
            )
    
    return img

# Generate icons
output_dir = os.path.dirname(__file__) + '/public/icons'
os.makedirs(output_dir, exist_ok=True)

print("Generating PWA icon assets...")

# Main app icons
print("  - icon-192.png (192x192)")
create_base_icon(192, "ASCA").save(f'{output_dir}/icon-192.png')

print("  - icon-512.png (512x512)")
create_base_icon(512, "ASCA").save(f'{output_dir}/icon-512.png')

# Maskable icons
print("  - icon-192-maskable.png (192x192 maskable)")
create_maskable_icon(192).save(f'{output_dir}/icon-192-maskable.png')

print("  - icon-512-maskable.png (512x512 maskable)")
create_maskable_icon(512).save(f'{output_dir}/icon-512-maskable.png')

# Shortcut icons
os.makedirs(f'{output_dir}/shortcuts', exist_ok=True)

shortcuts = {
    'calendar-96.png': 'CAL',
    'join-96.png': 'JN',
    'members-96.png': 'MEM',
    'donate-96.png': 'DON'
}

for filename, label in shortcuts.items():
    print(f"  - shortcuts/{filename}")
    create_base_icon(96, "A").save(f'{output_dir}/shortcuts/{filename}')

# Screenshots
os.makedirs(os.path.dirname(__file__) + '/public/screenshots', exist_ok=True)

print("  - narrow-540x720.png (540x720)")
create_screenshot(540, 720, "Mobile").save(os.path.dirname(__file__) + '/public/screenshots/narrow-540x720.png')

print("  - wide-1280x720.png (1280x720)")
create_screenshot(1280, 720, "Desktop").save(os.path.dirname(__file__) + '/public/screenshots/wide-1280x720.png')

print("\n[SUCCESS] All PWA assets generated!")
print(f"\nGenerated in: {output_dir}")
print("\nAssets created:")
print("  - icon-192.png, icon-512.png")
print("  - icon-192-maskable.png, icon-512-maskable.png")
print("  - shortcuts/ (calendar, join, members, donate)")
print("  - screenshots/ (narrow 540x720, wide 1280x720)")
