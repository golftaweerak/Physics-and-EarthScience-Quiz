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
    font_path = os.path.abspath(os.path.join(script_dir, '..', 'assets', 'fonts', 'Kanit-Regular.ttf'))
    
    if os.path.exists(font_path):
        return font_manager.FontProperties(fname=font_path)
    else:
        print(f"Warning: Font file not found at {font_path}. Using default system font.")
        return None

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
    ax.text(0, -0.2, 'O', ha='center', va='top', fontsize=14, fontweight='bold', fontproperties=font_prop)

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
    plt.savefig(output_path, bbox_inches='tight', pad_inches=0.1)
    print(f"ไดอะแกรมถูกบันทึกที่: {output_path}")

if __name__ == '__main__':
   
    create_torque_diagram_q13()