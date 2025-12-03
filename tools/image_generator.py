import matplotlib.pyplot as plt
import numpy as np
import os
from matplotlib import font_manager

def get_font_properties():
    """
    โหลดฟอนต์ Kanit และคืนค่า FontProperties object.
    ถ้าหาฟอนต์ไม่เจอ จะใช้ฟอนต์ปริยายของระบบแทน
    """
    # สร้าง path ไปยังไฟล์ฟอนต์โดยอิงจากตำแหน่งของสคริปต์นี้
    script_dir = os.path.dirname(__file__)
    # Use an absolute path to be safe
    font_path = os.path.abspath(os.path.join(script_dir, '..', 'assets', 'fonts', 'Kanit-Regular.ttf'))
    
    if os.path.exists(font_path):
        return font_manager.FontProperties(fname=font_path)
    else:
        print(f"Warning: Font file not found at {font_path}. Using default system font.")
        return None

def create_directory_if_not_exists(path):
    """Creates a directory if it does not already exist."""
    # Create the full path if it doesn't exist
    if not os.path.exists(os.path.dirname(path)):
        os.makedirs(os.path.dirname(path))

def create_torque_diagram_q13():
    """
    สร้างไดอะแกรมสำหรับโจทย์ phy_m4_ch4-6 ข้อ 13
    - คานมีจุดหมุนที่ O
    - แรง 30 N กระทำที่ระยะ 2 m (ตามเข็ม)
    - แรง 20 N กระทำที่ระยะ 4 m (ทวนเข็ม)
    """
    fig, ax = plt.subplots(figsize=(8, 4))
    font_prop = get_font_properties()

    # --- วาดคานและจุดหมุน ---
    ax.plot([-4.5, 2.5], [0, 0], color='black', linewidth=4, solid_capstyle='round')
    ax.plot(0, 0, 'ko', markersize=10, fillstyle='none', markeredgewidth=2)
    ax.plot(0, 0, 'k+', markersize=10, markeredgewidth=2)
    ax.text(0, -0.3, 'Fulcrum', ha='center', va='top', fontsize=12, fontproperties=font_prop)

    # --- วาดแรง ---
    # แรง 20 N (ทวนเข็ม)
    ax.arrow(-4, 1.5, 0, -1.2, head_width=0.2, head_length=0.3, fc='blue', ec='blue', length_includes_head=True)
    ax.text(-4, 1.8, '20 N', color='blue', ha='center', va='bottom', fontsize=12, fontweight='bold', fontproperties=font_prop)

    # แรง 30 N (ตามเข็ม)
    ax.arrow(2, 1.5, 0, -1.2, head_width=0.2, head_length=0.3, fc='red', ec='red', length_includes_head=True)
    ax.text(2, 1.8, '30 N', color='red', ha='center', va='bottom', fontsize=12, fontweight='bold', fontproperties=font_prop)

    # --- ป้ายกำกับระยะทาง ---
    # ระยะ 4 m
    ax.plot([-4, 0], [-0.6, -0.6], color='k', marker='|', markersize=10, linestyle='-')
    ax.text(-2, -0.75, '4 m', ha='center', va='top', fontsize=12, fontproperties=font_prop)

    # ระยะ 2 m
    ax.plot([0, 2], [-0.6, -0.6], color='k', marker='|', markersize=10, linestyle='-')
    ax.text(1, -0.75, '2 m', ha='center', va='top', fontsize=12, fontproperties=font_prop)

    # --- จัดการการแสดงผล ---
    ax.set_aspect('equal', adjustable='box')
    ax.set_xlim(-5, 3)
    ax.set_ylim(-1.5, 2.5)
    ax.axis('off')

    output_path = 'assets/images/phy_m4_ch4-6_q13.png'
    create_directory_if_not_exists(output_path)
    plt.savefig(output_path, bbox_inches='tight', pad_inches=0.1)
    plt.close()
    print(f"ไดอะแกรมถูกบันทึกที่: {output_path}")

def plot_pulley_system(ax, num_fixed, num_movable, rope_path, ima, pull_direction='down'):
    """Helper function to draw a generic pulley system."""
    font_prop = get_font_properties()
    
    # Support beam
    ax.plot([-1.5, 1.5], [5, 5], color='grey', linewidth=10)

    # Fixed pulleys
    for i in range(num_fixed):
        x_pos = (i - (num_fixed - 1) / 2.0) * 1.2
        ax.add_patch(plt.Circle((x_pos, 4.5), 0.4, fill=False, ec='black', lw=2))
        ax.plot([x_pos, x_pos], [4.5, 5], color='black', lw=2) # Axle

    # Movable pulleys
    movable_y = 1.5
    for i in range(num_movable):
        x_pos = (i - (num_movable - 1) / 2.0) * 1.2
        ax.add_patch(plt.Circle((x_pos, movable_y), 0.4, fill=False, ec='black', lw=2))
        ax.plot([x_pos, x_pos - 0.5], [movable_y, 0.5], color='black', lw=2) # Hook
        ax.plot([x_pos, x_pos + 0.5], [movable_y, 0.5], color='black', lw=2)

    # Weight
    ax.add_patch(plt.Rectangle((-0.5, -1), 1, 1, color='lightgrey', ec='black'))
    ax.text(0, -0.5, 'W', ha='center', va='center', fontsize=14, fontproperties=font_prop)
    ax.plot([0, 0], [0.5, -0.0], color='black', lw=2) # Attachment to weight

    # Rope
    rope_x, rope_y = zip(*rope_path)
    ax.plot(rope_x, rope_y, color='red', lw=2)

    # Pulling Force
    last_x, last_y = rope_path[-1]
    if pull_direction == 'down':
        ax.arrow(last_x, last_y, 0, -0.5, head_width=0.15, head_length=0.2, fc='red', ec='red', length_includes_head=True)
        ax.text(last_x + 0.2, last_y - 0.5, 'E', color='red', fontsize=14, fontproperties=font_prop)
    else: # up
        ax.arrow(last_x, last_y, 0, 0.5, head_width=0.15, head_length=0.2, fc='red', ec='red', length_includes_head=True)
        ax.text(last_x + 0.2, last_y + 0.5, 'E', color='red', fontsize=14, fontproperties=font_prop)

    ax.set_aspect('equal')
    ax.axis('off')

def plot_phy_m4_ch5_9_q19():
    """
    สร้างไดอะแกรมสำหรับโจทย์ phy_m4_ch5-9 ข้อ 19 (IMA = 4)
    ใช้ระบบรอกมาตรฐานแบบ 2 fixed, 2 movable pulleys for clarity.
    """
    fig, ax = plt.subplots(figsize=(4, 6))
    font_prop = get_font_properties()

    # Support
    ax.plot([-1.5, 1.5], [5, 5], color='grey', linewidth=10)

    # Pulleys
    ax.add_patch(plt.Circle((-0.5, 4.5), 0.4, fill=False, ec='black', lw=2)) # Fixed 1
    ax.add_patch(plt.Circle((0.5, 4.5), 0.4, fill=False, ec='black', lw=2))  # Fixed 2
    ax.plot([-0.5, -0.5, 0.5, 0.5], [4.9, 4.5, 4.5, 4.9], color='black') # Fixed axle
    ax.add_patch(plt.Circle((-0.5, 1.5), 0.4, fill=False, ec='black', lw=2)) # Movable 1
    ax.add_patch(plt.Circle((0.5, 1.5), 0.4, fill=False, ec='black', lw=2))  # Movable 2

    # Weight and attachment
    ax.plot([-0.5, 0.5], [1.1, 1.1], color='black') # Movable axle
    ax.plot([0, 0], [1.1, 0.5], color='black') # Hook
    ax.add_patch(plt.Rectangle((-0.5, -1), 1, 1, color='lightgrey', ec='black'))
    ax.text(0, -0.5, 'W', ha='center', va='center', fontsize=14, fontproperties=font_prop)

    # Rope
    rope_x = [1.2, 1.2, 0.9, 0.9, 0.1, 0.1, -0.1, -0.1, -0.9, -0.9, -1.2]
    rope_y = [4, 3.5, 3.5, 1.5, 1.5, 4.5, 4.5, 1.5, 1.5, 5, 5]
    ax.plot(rope_x, rope_y, color='red', lw=2)
    ax.arrow(1.2, 3.5, 0, -0.5, head_width=0.15, head_length=0.2, fc='red', ec='red', length_includes_head=True)
    ax.text(1.4, 3.2, 'E', color='red', fontsize=14, fontproperties=font_prop)

    ax.set_title("Pulley System (IMA = 4)", fontproperties=font_prop)
    ax.set_aspect('equal')
    ax.axis('off')
    
    output_path = 'assets/images/phy_m4_ch5-9_q19.png'
    create_directory_if_not_exists(output_path)
    plt.savefig(output_path, bbox_inches='tight', pad_inches=0.1)
    plt.close()
    print(f"ไดอะแกรมถูกบันทึกที่: {output_path}")

def plot_phy_m4_ch5_9_q36():
    """
    สร้างไดอะแกรมสำหรับโจทย์ phy_m4_ch5-9 ข้อ 36
    - ระบบรอก I.M.A = 3 (1 fixed, 1 movable, pull up)
    """
    fig, ax = plt.subplots(figsize=(4, 6))
    font_prop = get_font_properties()

    # Support
    ax.plot([-1.5, 1.5], [5, 5], color='grey', linewidth=10)

    # Pulleys
    ax.add_patch(plt.Circle((0.6, 4.5), 0.4, fill=False, ec='black', lw=2)) # Fixed
    ax.plot([0.6, 0.6], [4.5, 5], color='black') # Axle
    ax.add_patch(plt.Circle((0, 1.5), 0.4, fill=False, ec='black', lw=2)) # Movable

    # Weight and attachment
    ax.plot([0, 0], [1.1, 0.5], color='black') # Hook
    ax.add_patch(plt.Rectangle((-0.5, -0.5), 1, 1, color='lightgrey', ec='black'))
    ax.text(0, 0, 'W', ha='center', va='center', fontsize=14, fontproperties=font_prop)

    # Rope
    # Anchor to support, down around movable, up around fixed, pull up
    rope_x = [-0.6, -0.6, -0.4, -0.4, 0.2, 0.2, 1.0, 1.0, 1.2]
    rope_y = [5, 4, 4, 1.5, 1.5, 4.5, 4.5, 5, 5]
    ax.plot(rope_x, rope_y, color='red', lw=2)
    ax.arrow(1.2, 5, 0, 0.5, head_width=0.15, head_length=0.2, fc='red', ec='red', length_includes_head=True)
    ax.text(1.4, 5.2, 'E', color='red', fontsize=14, fontproperties=font_prop)

    ax.set_title("Pulley System (IMA = 3)", fontproperties=font_prop)
    ax.set_aspect('equal')
    ax.axis('off')

    output_path = 'assets/images/phy_m4_ch5-9_q36.png'
    create_directory_if_not_exists(output_path)
    plt.savefig(output_path, bbox_inches='tight', pad_inches=0.1)
    plt.close()
    print(f"ไดอะแกรมถูกบันทึกที่: {output_path}")

if __name__ == '__main__':
   
    create_torque_diagram_q13()
    plot_phy_m4_ch5_9_q19()
    plot_phy_m4_ch5_9_q36()