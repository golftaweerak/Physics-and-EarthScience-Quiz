import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np
import os
from scipy.interpolate import PchipInterpolator

output_dir = 'public/assets/images'
os.makedirs(output_dir, exist_ok=True)

plt.rcParams['font.family'] = 'DejaVu Sans'
plt.rcParams['font.size'] = 11

def add_label_box(ax, text, x, y, color='black', fontsize=10, fontweight='bold', ha='center', va='center', rotation=0):
    ax.text(x, y, text, color=color, fontsize=fontsize, fontweight=fontweight,
            ha=ha, va=va, rotation=rotation, zorder=10,
            bbox=dict(boxstyle='round,pad=0.2', facecolor='white', edgecolor='none', alpha=0.85))

def draw_incline_block(ax, s0, w, h, theta_deg, color='skyblue', ec='blue', label=''):
    theta = np.radians(theta_deg)
    # Bottom-left corner along incline
    x0 = (s0 - w / 2.0) * np.cos(theta)
    y0 = (s0 - w / 2.0) * np.sin(theta)
    
    rect = patches.Rectangle((x0, y0), w, h, angle=theta_deg, color=color, ec=ec, lw=2, zorder=3)
    ax.add_patch(rect)
    
    # Center of mass
    x_cm = s0 * np.cos(theta) - (h / 2.0) * np.sin(theta)
    y_cm = s0 * np.sin(theta) + (h / 2.0) * np.cos(theta)
    
    if label:
        ax.text(x_cm, y_cm, label, ha='center', va='center', rotation=theta_deg,
                fontweight='bold', fontsize=10, zorder=4)
        
    return x_cm, y_cm

# ==========================================
# DIAGRAMS FOR phy_m4_ch3-5
# ==========================================

def create_ch3_5_q5():
    fig, ax = plt.subplots(figsize=(6, 4), dpi=150)
    a = np.linspace(0, 5, 100)
    F_A = 4 * a
    F_B = 2 * a
    
    ax.plot(a, F_A, 'b-', linewidth=2.5, label='Object A (m_A = 4 kg)')
    ax.plot(a, F_B, 'r--', linewidth=2.5, label='Object B (m_B = 2 kg)')
    
    ax.set_xlabel('Acceleration a (m/s²)', fontsize=12, fontweight='bold')
    ax.set_ylabel('Force F (N)', fontsize=12, fontweight='bold')
    ax.set_title('Force vs Acceleration Graph', fontsize=13, fontweight='bold', pad=12)
    ax.set_xlim(0, 5)
    ax.set_ylim(0, 24)
    ax.grid(True, linestyle=':', alpha=0.7)
    ax.legend(fontsize=11)
    
    ax.plot(3, 12, 'bo', markersize=7)
    add_label_box(ax, '(3, 12)', 2.5, 14, color='blue', fontsize=10)
    
    ax.plot(4, 8, 'ro', markersize=7)
    add_label_box(ax, '(4, 8)', 3.8, 6.2, color='red', fontsize=10)
    
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'phy_m4_ch3-5_q5.png'), dpi=150)
    plt.close()

def create_ch3_5_q7():
    fig, ax = plt.subplots(figsize=(5.5, 3.5), dpi=150)
    ax.set_aspect('equal')
    ax.axis('off')
    
    theta_deg = 37
    theta = np.radians(theta_deg)
    L = 5.0
    xb = L * np.cos(theta)
    yb = L * np.sin(theta)
    
    # Incline triangle
    ax.plot([0, xb, xb, 0], [0, 0, yb, 0], 'k-', lw=2.5)
    
    # Angle arc
    arc = patches.Arc((0, 0), 1.4, 1.4, angle=0, theta1=0, theta2=theta_deg, color='darkgreen', lw=1.5)
    ax.add_patch(arc)
    add_label_box(ax, r'$37^\circ$', 1.1, 0.3, color='darkgreen', fontsize=10)
    add_label_box(ax, r'$\mu_k = 0.25$', 2.3, -0.3, color='darkgreen', fontsize=9.5)
    
    # Block flush on incline
    s0 = L * 0.55
    w, h = 1.0, 0.6
    draw_incline_block(ax, s0, w, h, theta_deg, color='skyblue', ec='blue', label='m = 5 kg')
    
    ax.set_xlim(-0.3, xb + 0.5)
    ax.set_ylim(-0.6, yb + 0.8)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'phy_m4_ch3-5_q7.png'), dpi=150)
    plt.close()

def create_ch3_5_q14():
    fig, ax = plt.subplots(figsize=(6, 4), dpi=150)
    
    F_static = np.linspace(0, 30, 100)
    f_static = F_static
    
    F_kinetic = np.linspace(30, 60, 100)
    f_kinetic = np.full_like(F_kinetic, 20)
    
    ax.plot(F_static, f_static, 'b-', linewidth=2.5, label='Static Region')
    ax.plot([30, 30], [30, 20], 'r--', linewidth=1.5)
    ax.plot(F_kinetic, f_kinetic, 'g-', linewidth=2.5, label='Kinetic Region')
    
    ax.plot(30, 30, 'ro', markersize=7)
    add_label_box(ax, r'$f_{s,max} = 30\text{ N}$', 20, 34, color='red', fontsize=10)
    
    ax.plot(45, 20, 'go', markersize=7)
    add_label_box(ax, r'$f_k = 20\text{ N}$', 45, 14, color='green', fontsize=10)
    
    ax.set_xlabel('Applied Force F (N)', fontsize=12, fontweight='bold')
    ax.set_ylabel('Friction Force f (N)', fontsize=12, fontweight='bold')
    ax.set_title('Friction Force vs Applied Force Graph', fontsize=13, fontweight='bold', pad=12)
    ax.set_xlim(0, 60)
    ax.set_ylim(0, 40)
    ax.grid(True, linestyle=':', alpha=0.7)
    ax.legend(fontsize=11)
    
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'phy_m4_ch3-5_q14.png'), dpi=150)
    plt.close()

def create_ch3_5_q18():
    fig, ax = plt.subplots(figsize=(4.5, 5), dpi=150)
    ax.set_aspect('equal')
    ax.axis('off')
    
    ax.plot([0.5, 3.5], [4.5, 4.5], 'k-', lw=3)
    for i in np.linspace(0.6, 3.4, 10):
        ax.plot([i, i+0.2], [4.5, 4.7], 'k-', lw=1)
        
    ax.plot([2, 2], [4.5, 3.8], 'k-', lw=2)
    pulley = patches.Circle((2, 3.5), 0.3, color='lightgray', ec='black', lw=2)
    ax.add_patch(pulley)
    ax.plot(2, 3.5, 'ko', markersize=4)
    
    ax.plot([1.7, 1.7], [3.5, 2.0], 'k-', lw=2)
    m1 = patches.Rectangle((1.35, 1.3), 0.7, 0.7, color='lightgreen', ec='darkgreen', lw=2)
    ax.add_patch(m1)
    ax.text(1.7, 1.65, r'$m_1=3\text{kg}$', ha='center', va='center', fontweight='bold', fontsize=10)
    
    ax.plot([2.3, 2.3], [3.5, 1.2], 'k-', lw=2)
    m2 = patches.Rectangle((1.9, 0.4), 0.8, 0.8, color='coral', ec='firebrick', lw=2)
    ax.add_patch(m2)
    ax.text(2.3, 0.8, r'$m_2=5\text{kg}$', ha='center', va='center', fontweight='bold', fontsize=10)
    
    ax.set_xlim(0.2, 3.8)
    ax.set_ylim(0, 5.0)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'phy_m4_ch3-5_q18.png'), dpi=150)
    plt.close()

def create_ch3_5_q19():
    fig, ax = plt.subplots(figsize=(6, 3.5), dpi=150)
    ax.set_aspect('equal')
    ax.axis('off')
    
    # Table surface
    ax.plot([0, 4.0, 4.0], [2.0, 2.0, 0], 'k-', lw=2.5)
    
    # Block m1 on table
    w1, h1 = 1.0, 0.6
    b1 = patches.Rectangle((1.2, 2.0), w1, h1, color='skyblue', ec='blue', lw=2)
    ax.add_patch(b1)
    ax.text(1.7, 2.3, r'$m_1=4\text{kg}$', ha='center', va='center', fontweight='bold', fontsize=10)
    
    # Pulley geometry: Top tangent MUST be at height y = 2.0 + h1/2 = 2.3 to make string 100% HORIZONTAL!
    R_p = 0.2
    p_center_y = 2.0 + (h1 / 2.0) - R_p # 2.1
    p_center_x = 4.0 + R_p # 4.2
    
    # Pulley bracket from table edge
    ax.plot([4.0, p_center_x], [2.0, p_center_y], 'k-', lw=2.5)
    pulley = patches.Circle((p_center_x, p_center_y), R_p, color='lightgray', ec='black', lw=2, zorder=4)
    ax.add_patch(pulley)
    ax.plot(p_center_x, p_center_y, 'ko', markersize=3, zorder=5)
    
    # 100% PERFECTLY HORIZONTAL ROPE at height y = 2.3
    rope_h_y = 2.0 + (h1 / 2.0) # 2.3
    ax.plot([1.2 + w1, p_center_x], [rope_h_y, rope_h_y], 'k-', lw=2)
    
    # Single vertical rope from right edge of pulley (x = 4.2 + 0.2 = 4.4) to hanging block m2
    rope_v_x = p_center_x + R_p # 4.4
    ax.plot([rope_v_x, rope_v_x], [p_center_y, 1.2], 'k-', lw=2)
    
    # Hanging block m2 centered horizontally at x = 4.4 (well to the right of table edge x = 4.0)
    w2, h2 = 0.7, 0.8
    b2 = patches.Rectangle((rope_v_x - w2/2.0, 0.4), w2, h2, color='sandybrown', ec='chocolate', lw=2)
    ax.add_patch(b2)
    ax.text(rope_v_x, 0.8, r'$m_2=6\text{kg}$', ha='center', va='center', fontweight='bold', fontsize=10)
    
    ax.set_xlim(-0.2, 5.2)
    ax.set_ylim(-0.2, 3.0)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'phy_m4_ch3-5_q19.png'), dpi=150)
    plt.close()

def create_ch3_5_q21():
    fig, ax = plt.subplots(figsize=(6.5, 4), dpi=150)
    ax.set_aspect('equal')
    ax.axis('off')
    
    theta_deg = 30
    theta = np.radians(theta_deg)
    L = 4.5
    xb = L * np.cos(theta)
    yb = L * np.sin(theta)
    
    # Incline triangle
    ax.plot([0, xb, xb, 0], [0, 0, yb, 0], 'k-', lw=2.5)
    arc = patches.Arc((0,0), 1.2, 1.2, angle=0, theta1=0, theta2=30, color='darkgreen', lw=1.5)
    ax.add_patch(arc)
    add_label_box(ax, r'$30^\circ$', 1.1, 0.25, color='darkgreen', fontsize=10)
    
    # Block flush on incline
    s0 = L * 0.5
    w1, h1 = 1.0, 0.6
    x_cm, y_cm = draw_incline_block(ax, s0, w1, h1, theta_deg, color='lightgreen', ec='green', label=r'$m_1=6\text{kg}$')
    
    # Pulley geometry
    R_p = 0.25
    p_cx = xb + (h1 / 2.0 - R_p) * (-np.sin(theta)) + R_p * np.cos(theta)
    p_cy = yb + (h1 / 2.0 - R_p) * (np.cos(theta)) + R_p * np.sin(theta)
    
    ax.plot([xb, p_cx], [yb, p_cy], 'k-', lw=2.5)
    pulley = patches.Circle((p_cx, p_cy), R_p, color='lightgray', ec='black', lw=2, zorder=4)
    ax.add_patch(pulley)
    ax.plot(p_cx, p_cy, 'ko', markersize=3, zorder=5)
    
    rope_start_x = (s0 + w1 / 2.0) * np.cos(theta) - (h1 / 2.0) * np.sin(theta)
    rope_start_y = (s0 + w1 / 2.0) * np.sin(theta) + (h1 / 2.0) * np.cos(theta)
    
    rope_p_top_x = p_cx - R_p * np.sin(theta)
    rope_p_top_y = p_cy + R_p * np.cos(theta)
    ax.plot([rope_start_x, rope_p_top_x], [rope_start_y, rope_p_top_y], 'k-', lw=2)
    
    rope_v_x = p_cx + R_p
    ax.plot([rope_v_x, rope_v_x], [p_cy, yb - 0.7], 'k-', lw=2)
    
    w2, h2 = 0.7, 0.7
    b2 = patches.Rectangle((rope_v_x - w2/2.0, yb - 1.4), w2, h2, color='gold', ec='darkgoldenrod', lw=2)
    ax.add_patch(b2)
    ax.text(rope_v_x, yb - 1.05, r'$m_2=4\text{kg}$', fontsize=9, fontweight='bold', ha='center', va='center')
    
    ax.set_xlim(-0.3, xb + 1.2)
    ax.set_ylim(-0.3, yb + 0.8)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'phy_m4_ch3-5_q21.png'), dpi=150)
    plt.close()

def create_ch3_5_q23():
    fig, ax = plt.subplots(figsize=(5.5, 3.5), dpi=150)
    ax.set_aspect('equal')
    ax.axis('off')
    
    # Floor
    ax.plot([0, 5], [1, 1], 'k-', lw=2.5)
    for i in np.linspace(0.1, 4.9, 15):
        ax.plot([i, i-0.15], [1, 0.8], 'k-', lw=1)
        
    b = patches.Rectangle((1.5, 1.0), 1.2, 0.8, color='plum', ec='purple', lw=2)
    ax.add_patch(b)
    ax.text(2.1, 1.4, 'm = 10 kg', ha='center', va='center', fontweight='bold', fontsize=10)
    
    theta = np.radians(37)
    fx = 2.7 + 1.6 * np.cos(theta)
    fy = 1.4 + 1.6 * np.sin(theta)
    
    ax.annotate('', xy=(fx, fy), xytext=(2.7, 1.4),
                arrowprops=dict(arrowstyle="->", color="crimson", lw=2.5))
    add_label_box(ax, 'F = 50 N', fx + 0.55, fy + 0.15, color='crimson', fontsize=11)
    
    ax.plot([2.7, 4.3], [1.4, 1.4], 'k--', lw=1.2)
    arc = patches.Arc((2.7, 1.4), 1.0, 1.0, angle=0, theta1=0, theta2=37, color='darkgreen', lw=1.5)
    ax.add_patch(arc)
    add_label_box(ax, r'$37^\circ$', 3.5, 1.75, color='darkgreen', fontsize=10)
    
    ax.set_xlim(0, 5.8)
    ax.set_ylim(0.5, 3.2)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'phy_m4_ch3-5_q23.png'), dpi=150)
    plt.close()

def create_ch3_5_q29():
    fig, ax = plt.subplots(figsize=(4.5, 4.5), dpi=150)
    ax.set_aspect('equal')
    
    ax.axhline(0, color='gray', lw=1, ls='--')
    ax.axvline(0, color='gray', lw=1, ls='--')
    
    circle = patches.Circle((0,0), 0.25, color='lightblue', ec='navy', lw=2)
    ax.add_patch(circle)
    ax.text(0, 0, 'm=2kg', ha='center', va='center', fontsize=8, fontweight='bold')
    
    ax.annotate('', xy=(2.4, 0), xytext=(0.25, 0),
                arrowprops=dict(arrowstyle="->", color="red", lw=2.5))
    add_label_box(ax, r'$F_1 = 12\text{ N}$', 1.5, -0.4, color='red', fontsize=10)
    
    ax.annotate('', xy=(0, 1.5), xytext=(0, 0.25),
                arrowprops=dict(arrowstyle="->", color="blue", lw=2.5))
    add_label_box(ax, r'$F_2 = 5\text{ N}$', -0.8, 1.5, color='blue', fontsize=10)
    
    ax.annotate('', xy=(-0.9, 0), xytext=(-0.25, 0),
                arrowprops=dict(arrowstyle="->", color="green", lw=2.5))
    add_label_box(ax, r'$F_3 = 3\text{ N}$', -1.2, -0.4, color='green', fontsize=10)
    
    ax.set_xlim(-2.2, 3.2)
    ax.set_ylim(-1.0, 2.2)
    ax.grid(True, linestyle=':', alpha=0.5)
    ax.set_title('Forces Acting on Mass m', fontsize=12, fontweight='bold')
    
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'phy_m4_ch3-5_q29.png'), dpi=150)
    plt.close()


# ==========================================
# DIAGRAMS FOR phy_m4_ch3-6
# ==========================================

def create_ch3_6_q2():
    fig, ax = plt.subplots(figsize=(6, 4), dpi=150)
    r = np.linspace(1, 5, 200)
    F = 100 / (r**2)
    
    ax.plot(r, F, 'b-', linewidth=2.5, label=r'$F_g \propto \frac{1}{r^2}$')
    
    r_points = [1, 2, 4]
    F_points = [100, 25, 6.25]
    labels = [r'$(R, F_0)$', r'$(2R, \frac{F_0}{4})$', r'$(4R, \frac{F_0}{16})$']
    
    for rp, fp, lbl in zip(r_points, F_points, labels):
        ax.plot(rp, fp, 'ro', markersize=6)
        ax.plot([rp, rp], [0, fp], 'k:', alpha=0.5)
        ax.plot([0, rp], [fp, fp], 'k:', alpha=0.5)
        add_label_box(ax, lbl, rp + 0.5, fp + 8, color='darkred', fontsize=10)

    ax.set_xlabel('Distance r (in terms of R)', fontsize=12, fontweight='bold')
    ax.set_ylabel('Gravitational Force F_g', fontsize=12, fontweight='bold')
    ax.set_title('Gravitational Force vs Distance Graph', fontsize=13, fontweight='bold', pad=12)
    ax.set_xlim(0, 5.2)
    ax.set_ylim(0, 115)
    ax.grid(True, linestyle=':', alpha=0.7)
    ax.legend(fontsize=11)
    
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'phy_m4_ch3-6_q2.png'), dpi=150)
    plt.close()

def create_ch3_6_q6():
    fig, ax = plt.subplots(figsize=(4.5, 4.5), dpi=150)
    ax.set_aspect('equal')
    ax.axis('off')
    
    earth = patches.Circle((0, 0), 1.2, color='deepskyblue', ec='navy', lw=2)
    ax.add_patch(earth)
    ax.text(0, 0, 'Earth\n(M)', color='white', ha='center', va='center', fontweight='bold', fontsize=10)
    
    orbit = patches.Circle((0, 0), 2.5, fill=False, color='gray', ls='--', lw=1.5)
    ax.add_patch(orbit)
    
    sat = patches.Rectangle((-0.2, 2.35), 0.4, 0.3, color='orange', ec='darkred', lw=1.5)
    ax.add_patch(sat)
    add_label_box(ax, 'Satellite (m)', 0, 2.85, color='darkred', fontsize=10)
    
    ax.annotate('', xy=(0, 1.3), xytext=(0, 2.35),
                arrowprops=dict(arrowstyle="->", color="crimson", lw=2.5))
    add_label_box(ax, r'$F_g$', 0.4, 1.8, color='crimson', fontsize=11)
    
    ax.annotate('', xy=(-1.2, 2.5), xytext=(-0.2, 2.5),
                arrowprops=dict(arrowstyle="->", color="green", lw=2.5))
    add_label_box(ax, r'$v$', -0.7, 2.8, color='green', fontsize=11)
    
    ax.plot([0, 1.77], [0, 1.77], 'k:', lw=1.2)
    add_label_box(ax, 'r', 0.9, 0.7, color='black', fontsize=11)
    
    ax.set_xlim(-3.0, 3.0)
    ax.set_ylim(-3.0, 3.2)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'phy_m4_ch3-6_q6.png'), dpi=150)
    plt.close()

def create_ch3_6_q10():
    fig, ax = plt.subplots(figsize=(6, 3), dpi=150)
    ax.set_aspect('equal')
    ax.axis('off')
    
    earth = patches.Circle((0, 0), 0.8, color='dodgerblue', ec='navy', lw=2)
    ax.add_patch(earth)
    ax.text(0, 0, r'$M_E$', color='white', ha='center', va='center', fontweight='bold', fontsize=11)
    
    moon = patches.Circle((5, 0), 0.4, color='lightgray', ec='dimgray', lw=2)
    ax.add_patch(moon)
    ax.text(5, 0, r'$M_M$', color='black', ha='center', va='center', fontweight='bold', fontsize=9)
    
    ax.plot([0, 5], [0, 0], 'k--', lw=1)
    
    Px = 4.0
    ax.plot(Px, 0, 'rx', markersize=10, markeredgewidth=2.5)
    add_label_box(ax, 'Point P\n(g_net = 0)', Px, 0.45, color='red', fontsize=9)
    
    ax.annotate('', xy=(Px - 0.8, 0), xytext=(Px, 0),
                arrowprops=dict(arrowstyle="->", color="blue", lw=2))
    add_label_box(ax, r'$g_E$', Px - 0.4, -0.45, color='blue', fontsize=10)
    
    ax.annotate('', xy=(Px + 0.8, 0), xytext=(Px, 0),
                arrowprops=dict(arrowstyle="->", color="purple", lw=2))
    add_label_box(ax, r'$g_M$', Px + 0.4, -0.45, color='purple', fontsize=10)
    
    ax.set_xlim(-1.2, 6.0)
    ax.set_ylim(-1.0, 1.2)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'phy_m4_ch3-6_q10.png'), dpi=150)
    plt.close()

def create_ch3_6_q13():
    fig, ax = plt.subplots(figsize=(6, 3.8), dpi=150)
    
    t1 = np.linspace(0, 4, 50)
    v1 = 3 * t1
    
    t2 = np.linspace(4, 10, 50)
    v2 = 12 + 1 * (t2 - 4)
    
    ax.plot(t1, v1, 'b-', lw=2.5, label='Phase 1 (0-4 s)')
    ax.plot(t2, v2, 'r-', lw=2.5, label='Phase 2 (4-10 s)')
    
    ax.plot(4, 12, 'ko', markersize=6)
    add_label_box(ax, '(4, 12)', 3.2, 13.5, color='black', fontsize=10)
    
    ax.plot(10, 18, 'ko', markersize=6)
    add_label_box(ax, '(10, 18)', 9.2, 19.5, color='black', fontsize=10)
    
    ax.set_xlabel('Time t (s)', fontsize=12, fontweight='bold')
    ax.set_ylabel('Velocity v (m/s)', fontsize=12, fontweight='bold')
    ax.set_title('Velocity vs Time Graph for Mass m = 4 kg', fontsize=12, fontweight='bold', pad=12)
    ax.set_xlim(0, 11)
    ax.set_ylim(0, 22)
    ax.grid(True, linestyle=':', alpha=0.7)
    ax.legend(fontsize=10)
    
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'phy_m4_ch3-6_q13.png'), dpi=150)
    plt.close()

def create_ch3_6_q15():
    fig, ax = plt.subplots(figsize=(6.5, 4), dpi=150)
    ax.set_aspect('equal')
    ax.axis('off')
    
    theta_deg = 37
    theta = np.radians(theta_deg)
    L = 4.5
    xb = L * np.cos(theta)
    yb = L * np.sin(theta)
    
    ax.plot([0, xb, xb, 0], [0, 0, yb, 0], 'k-', lw=2.5)
    arc = patches.Arc((0,0), 1.2, 1.2, angle=0, theta1=0, theta2=37, color='darkgreen', lw=1.5)
    ax.add_patch(arc)
    add_label_box(ax, r'$37^\circ$', 0.8, 0.25, color='darkgreen', fontsize=10)
    
    s0 = L * 0.5
    w1, h1 = 1.0, 0.6
    x_cm, y_cm = draw_incline_block(ax, s0, w1, h1, theta_deg, color='plum', ec='purple', label=r'$m_1=4\text{kg}$')
    
    R_p = 0.25
    p_cx = xb + (h1 / 2.0 - R_p) * (-np.sin(theta)) + R_p * np.cos(theta)
    p_cy = yb + (h1 / 2.0 - R_p) * (np.cos(theta)) + R_p * np.sin(theta)
    
    ax.plot([xb, p_cx], [yb, p_cy], 'k-', lw=2.5)
    pulley = patches.Circle((p_cx, p_cy), R_p, color='lightgray', ec='black', lw=2, zorder=4)
    ax.add_patch(pulley)
    ax.plot(p_cx, p_cy, 'ko', markersize=3, zorder=5)
    
    rope_start_x = (s0 + w1 / 2.0) * np.cos(theta) - (h1 / 2.0) * np.sin(theta)
    rope_start_y = (s0 + w1 / 2.0) * np.sin(theta) + (h1 / 2.0) * np.cos(theta)
    
    rope_p_top_x = p_cx - R_p * np.sin(theta)
    rope_p_top_y = p_cy + R_p * np.cos(theta)
    ax.plot([rope_start_x, rope_p_top_x], [rope_start_y, rope_p_top_y], 'k-', lw=2)
    
    rope_v_x = p_cx + R_p
    ax.plot([rope_v_x, rope_v_x], [p_cy, yb - 0.7], 'k-', lw=2)
    
    w2, h2 = 0.7, 0.7
    b2 = patches.Rectangle((rope_v_x - w2/2.0, yb - 1.4), w2, h2, color='sandybrown', ec='saddlebrown', lw=2)
    ax.add_patch(b2)
    ax.text(rope_v_x, yb - 1.05, r'$m_2=5\text{kg}$', fontsize=9, fontweight='bold', ha='center', va='center')
    
    ax.set_xlim(-0.3, xb + 1.2)
    ax.set_ylim(-0.3, yb + 0.8)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'phy_m4_ch3-6_q15.png'), dpi=150)
    plt.close()

def create_ch3_6_q18():
    fig, ax = plt.subplots(figsize=(5.5, 3), dpi=150)
    ax.set_aspect('equal')
    ax.axis('off')
    
    ax.plot([0, 5], [0.8, 0.8], 'k-', lw=2.5)
    for i in np.linspace(0.1, 4.9, 15):
        ax.plot([i, i-0.15], [0.8, 0.6], 'k-', lw=1)
        
    b2 = patches.Rectangle((1.5, 0.8), 1.6, 0.7, color='lightblue', ec='navy', lw=2)
    ax.add_patch(b2)
    ax.text(2.3, 1.15, r'$m_2 = 6\text{ kg}$', ha='center', va='center', fontweight='bold', fontsize=10)
    
    b1 = patches.Rectangle((1.8, 1.5), 1.0, 0.6, color='lightcoral', ec='firebrick', lw=2)
    ax.add_patch(b1)
    ax.text(2.3, 1.8, r'$m_1 = 2\text{ kg}$', ha='center', va='center', fontweight='bold', fontsize=10)
    
    ax.annotate('', xy=(4.2, 1.15), xytext=(3.1, 1.15),
                arrowprops=dict(arrowstyle="->", color="crimson", lw=2.5))
    add_label_box(ax, 'F', 4.4, 1.15, color='crimson', fontsize=12)
    
    ax.set_xlim(0, 5.2)
    ax.set_ylim(0.4, 2.5)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'phy_m4_ch3-6_q18.png'), dpi=150)
    plt.close()

def create_ch3_6_q22():
    fig, ax = plt.subplots(figsize=(6.5, 3.5), dpi=150)
    ax.set_aspect('equal')
    ax.axis('off')
    
    # Table surface from x=1.2 to x=3.8
    ax.plot([1.2, 3.8], [2.0, 2.0], 'k-', lw=2.5)
    ax.plot([1.2, 1.2], [2.0, 0.5], 'k-', lw=2)
    ax.plot([3.8, 3.8], [2.0, 0.5], 'k-', lw=2)
    
    w2, h2 = 1.0, 0.6
    b2 = patches.Rectangle((2.0, 2.0), w2, h2, color='lightgreen', ec='darkgreen', lw=2)
    ax.add_patch(b2)
    ax.text(2.5, 2.3, r'$m_2=5\text{kg}$', ha='center', va='center', fontweight='bold', fontsize=9)
    
    R_p = 0.2
    rope_h_y = 2.0 + (h2 / 2.0) # 2.3
    
    # Left pulley at (0.95, 2.1)
    p_left_y = rope_h_y - R_p # 2.1
    p_left_x = 1.2 - R_p - 0.05
    ax.plot([1.2, p_left_x], [2.0, p_left_y], 'k-', lw=2)
    p_left = patches.Circle((p_left_x, p_left_y), R_p, color='lightgray', ec='black', lw=1.5, zorder=4)
    ax.add_patch(p_left)
    ax.plot(p_left_x, p_left_y, 'ko', markersize=3, zorder=5)
    
    # 100% PERFECTLY HORIZONTAL ROPE at height y = 2.3
    ax.plot([2.0, p_left_x], [rope_h_y, rope_h_y], 'k-', lw=1.8)
    rope_l_v_x = p_left_x - R_p
    ax.plot([rope_l_v_x, rope_l_v_x], [p_left_y, 0.8], 'k-', lw=1.8)
    
    w1, h1 = 0.6, 0.6
    b1 = patches.Rectangle((rope_l_v_x - w1/2.0, 0.2), w1, h1, color='coral', ec='firebrick', lw=2)
    ax.add_patch(b1)
    ax.text(rope_l_v_x, 0.5, r'$m_1=2\text{kg}$', ha='center', va='center', fontweight='bold', fontsize=8)
    
    # Right pulley at (4.05, 2.1)
    p_right_y = rope_h_y - R_p # 2.1
    p_right_x = 3.8 + R_p + 0.05
    ax.plot([3.8, p_right_x], [2.0, p_right_y], 'k-', lw=2)
    p_right = patches.Circle((p_right_x, p_right_y), R_p, color='lightgray', ec='black', lw=1.5, zorder=4)
    ax.add_patch(p_right)
    ax.plot(p_right_x, p_right_y, 'ko', markersize=3, zorder=5)
    
    # 100% PERFECTLY HORIZONTAL ROPE at height y = 2.3
    ax.plot([3.0, p_right_x], [rope_h_y, rope_h_y], 'k-', lw=1.8)
    rope_r_v_x = p_right_x + R_p
    ax.plot([rope_r_v_x, rope_r_v_x], [p_right_y, 0.6], 'k-', lw=1.8)
    
    w3, h3 = 0.6, 0.6
    b3 = patches.Rectangle((rope_r_v_x - w3/2.0, 0.0), w3, h3, color='gold', ec='darkgoldenrod', lw=2)
    ax.add_patch(b3)
    ax.text(rope_r_v_x, 0.3, r'$m_3=8\text{kg}$', ha='center', va='center', fontweight='bold', fontsize=8)
    
    ax.set_xlim(0.1, 4.9)
    ax.set_ylim(-0.3, 2.8)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'phy_m4_ch3-6_q22.png'), dpi=150)
    plt.close()

def create_ch3_6_q26():
    fig, ax = plt.subplots(figsize=(5.5, 3.5), dpi=150)
    ax.set_aspect('equal')
    ax.axis('off')
    
    ax.plot([0, 5], [1, 1], 'k-', lw=2.5)
    for i in np.linspace(0.1, 4.9, 15):
        ax.plot([i, i-0.15], [1, 0.8], 'k-', lw=1)
        
    b = patches.Rectangle((2.0, 1.0), 1.2, 0.8, color='thistle', ec='purple', lw=2)
    ax.add_patch(b)
    ax.text(2.6, 1.4, 'm = 10 kg', ha='center', va='center', fontweight='bold', fontsize=10)
    
    theta = np.radians(37)
    fx_start = 2.0 - 1.5 * np.cos(theta)
    fy_start = 1.8 + 1.5 * np.sin(theta)
    
    ax.annotate('', xy=(2.0, 1.8), xytext=(fx_start, fy_start),
                arrowprops=dict(arrowstyle="->", color="crimson", lw=2.5))
    add_label_box(ax, 'F = 100 N', fx_start - 0.5, fy_start + 0.25, color='crimson', fontsize=11)
    
    ax.plot([0.5, 2.0], [1.8, 1.8], 'k--', lw=1.2)
    arc = patches.Arc((2.0, 1.8), 1.0, 1.0, angle=0, theta1=143, theta2=180, color='darkgreen', lw=1.5)
    ax.add_patch(arc)
    add_label_box(ax, r'$37^\circ$', 1.35, 2.05, color='darkgreen', fontsize=10)
    
    ax.set_xlim(0, 5.0)
    ax.set_ylim(0.5, 3.4)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'phy_m4_ch3-6_q26.png'), dpi=150)
    plt.close()

# ==========================================
# DIAGRAMS FOR phy_m4_ch3-1
# ==========================================

def create_ch3_1_scenario1():
    fig, ax = plt.subplots(figsize=(5.0, 4.0), dpi=150)
    ax.set_aspect('equal')
    ax.axis('off')
    
    # Origin and block
    x0, y0 = 1.0, 1.0
    w, h = 1.0, 0.8
    block = patches.Rectangle((x0 - w/2, y0 - h/2), w, h, color='skyblue', ec='blue', lw=2, zorder=3)
    ax.add_patch(block)
    ax.text(x0, y0, 'm', ha='center', va='center', fontweight='bold', fontsize=12, zorder=4)
    
    # F1 (East / Right)
    ax.annotate('', xy=(x0 + 2.5, y0), xytext=(x0 + w/2, y0),
                arrowprops=dict(arrowstyle="->", color="dodgerblue", lw=2.5))
    add_label_box(ax, r'$F_1 = 8\text{ N}$ (East)', x0 + 1.6, y0 - 0.45, color='dodgerblue', fontsize=10)
    
    # F2 (North / Up)
    ax.annotate('', xy=(x0, y0 + 2.0), xytext=(x0, y0 + h/2),
                arrowprops=dict(arrowstyle="->", color="crimson", lw=2.5))
    add_label_box(ax, r'$F_2 = 6\text{ N}$ (North)', x0 - 1.1, y0 + 1.2, color='crimson', fontsize=10)
    
    ax.set_xlim(-0.3, 4.0)
    ax.set_ylim(-0.2, 3.4)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'phy_m4_ch3-1_scenario1.png'), dpi=150)
    plt.close()

def create_ch3_1_scenario2():
    fig, ax = plt.subplots(figsize=(5.5, 3.2), dpi=150)
    ax.set_aspect('equal')
    ax.axis('off')
    
    # Ground
    ax.plot([0, 5.2], [1, 1], 'k-', lw=2.5)
    for i in np.linspace(0.1, 5.1, 17):
        ax.plot([i, i - 0.15], [1, 0.8], 'k-', lw=1)
    add_label_box(ax, r'$\mu_k = 0.2$', 0.8, 0.45, color='darkgreen', fontsize=10)
        
    # Box 10 kg
    bw, bh = 1.4, 0.9
    bx, by = 1.8, 1.0
    rect = patches.Rectangle((bx, by), bw, bh, facecolor='#FFE0B2', ec='#E65100', lw=2, zorder=3)
    ax.add_patch(rect)
    cx, cy = bx + bw/2.0, by + bh/2.0
    ax.text(cx, cy, 'm = 10 kg', ha='center', va='center', fontweight='bold', fontsize=11, zorder=4)
    
    # Pull Force F = 50 N to the right
    ax.annotate('', xy=(bx + bw + 1.6, cy), xytext=(bx + bw, cy),
                arrowprops=dict(arrowstyle="->", color="crimson", lw=2.5))
    add_label_box(ax, r'$F = 50\text{ N}$', bx + bw + 0.9, cy + 0.35, color='crimson', fontsize=10)
    
    ax.set_xlim(-0.1, 5.4)
    ax.set_ylim(0.2, 2.5)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'phy_m4_ch3-1_scenario2.png'), dpi=150)
    plt.close()

def create_ch3_1_scenario3():
    fig, ax = plt.subplots(figsize=(5.0, 4.8), dpi=150)
    ax.set_aspect('equal')
    ax.axis('off')
    
    # Elevator frame
    ex, ey, ew, eh = 1.0, 0.5, 2.5, 3.5
    elev = patches.Rectangle((ex, ey), ew, eh, facecolor='#ECEFF1', ec='#37474F', lw=2.5, zorder=1)
    ax.add_patch(elev)
    
    # Elevator cable
    ax.plot([ex + ew/2, ex + ew/2], [ey + eh, ey + eh + 0.8], 'k-', lw=3)
    
    # Scale on floor
    sw, sh = 1.4, 0.25
    sx, sy = ex + (ew - sw)/2, ey + 0.2
    scale = patches.Rectangle((sx, sy), sw, sh, facecolor='#B0BEC5', ec='#263238', lw=1.5, zorder=2)
    ax.add_patch(scale)
    ax.text(sx + sw/2, sy + sh/2, 'Scale', ha='center', va='center', fontweight='bold', fontsize=8, color='#1A237E', zorder=3)
    
    # Person / Box on scale
    pw, ph = 0.9, 1.2
    px, py = ex + (ew - pw)/2, sy + sh
    person = patches.Rectangle((px, py), pw, ph, facecolor='#90CAF9', ec='#1565C0', lw=2, zorder=3)
    ax.add_patch(person)
    pcx, pcy = px + pw/2, py + ph/2
    ax.text(pcx, pcy, 'm = 70 kg', ha='center', va='center', fontweight='bold', fontsize=10, zorder=4)
    
    # Motion / Acceleration Arrow
    ax.annotate('', xy=(ex + ew + 0.5, ey + eh - 0.5), xytext=(ex + ew + 0.5, ey + 1.0),
                arrowprops=dict(arrowstyle="->", color="darkgreen", lw=2.5))
    add_label_box(ax, r'$a = 2\text{ m/s}^2$ (Up)', ex + ew + 0.9, ey + 2.0, color='darkgreen', fontsize=10)
    
    ax.set_xlim(0.2, 5.4)
    ax.set_ylim(0.1, 5.0)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'phy_m4_ch3-1_scenario3.png'), dpi=150)
    plt.close()

# ==========================================
# DIAGRAMS FOR phy_m4_ch3-re1
# ==========================================

def create_ch3_re1_scenario3():
    fig, ax = plt.subplots(figsize=(5.5, 3.2), dpi=150)
    ax.set_aspect('equal')
    ax.axis('off')
    
    # Ground
    ax.plot([0, 5.2], [1, 1], 'k-', lw=2.5)
    for i in np.linspace(0.1, 5.1, 17):
        ax.plot([i, i - 0.15], [1, 0.8], 'k-', lw=1)
    add_label_box(ax, r'$\mu_s = 0.6, \mu_k = 0.4$', 0.9, 0.45, color='darkgreen', fontsize=9.5)
        
    # Box 20 kg
    bw, bh = 1.5, 0.95
    bx, by = 1.8, 1.0
    rect = patches.Rectangle((bx, by), bw, bh, facecolor='#C8E6C9', ec='#2E7D32', lw=2, zorder=3)
    ax.add_patch(rect)
    cx, cy = bx + bw/2.0, by + bh/2.0
    ax.text(cx, cy, 'm = 20 kg', ha='center', va='center', fontweight='bold', fontsize=11, zorder=4)
    
    # Pull force F
    ax.annotate('', xy=(bx + bw + 1.5, cy), xytext=(bx + bw, cy),
                arrowprops=dict(arrowstyle="->", color="crimson", lw=2.5))
    add_label_box(ax, r'$F = 150\text{ N}$', bx + bw + 0.85, cy + 0.35, color='crimson', fontsize=10)
    
    ax.set_xlim(-0.1, 5.4)
    ax.set_ylim(0.2, 2.5)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'phy_m4_ch3-re1_scenario3.png'), dpi=150)
    plt.close()

def create_ch3_re1_scenario4():
    fig, ax = plt.subplots(figsize=(5.5, 3.5), dpi=150)
    ax.set_aspect('equal')
    ax.axis('off')
    
    theta_deg = 30
    theta = np.radians(theta_deg)
    L = 5.2
    xb = L * np.cos(theta)
    yb = L * np.sin(theta)
    
    # Incline triangle
    ax.plot([0, xb, xb, 0], [0, 0, yb, 0], 'k-', lw=2.5)
    
    # Angle arc
    arc = patches.Arc((0, 0), 1.5, 1.5, angle=0, theta1=0, theta2=theta_deg, color='purple', lw=1.5)
    ax.add_patch(arc)
    add_label_box(ax, r'$30^\circ$', 1.2, 0.28, color='purple', fontsize=10)
    add_label_box(ax, r'$\mu_k = 0.3$', 2.6, -0.3, color='darkgreen', fontsize=9.5)
    
    # Block flush on incline
    s0 = L * 0.55
    w, h = 1.1, 0.7
    x_cm, y_cm = draw_incline_block(ax, s0, w, h, theta_deg, color='skyblue', ec='blue', label='m = 5 kg')
    
    ax.set_xlim(-0.3, xb + 0.5)
    ax.set_ylim(-0.6, yb + 0.8)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'phy_m4_ch3-re1_scenario4.png'), dpi=150)
    plt.close()

# ==========================================
# DIAGRAMS FOR Astro1-data.js
# ==========================================

def create_astro1_q9_elongation():
    fig, ax = plt.subplots(figsize=(6, 5.5), dpi=150)
    ax.set_aspect('equal')
    ax.axis('off')

    # Sun
    sun = patches.Circle((0, 0), 0.35, color='gold', ec='orange', lw=2, zorder=5)
    ax.add_patch(sun)
    ax.text(0, 0, 'Sun', ha='center', va='center', fontweight='bold', fontsize=9)

    # Inner planet orbit (Venus)
    r_inner = 2.0
    orbit_in = patches.Circle((0, 0), r_inner, color='gray', fill=False, ls='--', lw=1.5)
    ax.add_patch(orbit_in)

    # Earth orbit
    r_earth = 3.5
    orbit_e = patches.Circle((0, 0), r_earth, color='royalblue', fill=False, ls=':', lw=1.5)
    ax.add_patch(orbit_e)

    # Earth position
    ex, ey = 0, -r_earth
    earth = patches.Circle((ex, ey), 0.22, color='deepskyblue', ec='navy', lw=2, zorder=5)
    ax.add_patch(earth)
    ax.text(ex, ey - 0.45, 'Earth', ha='center', va='center', fontweight='bold', fontsize=10, color='navy')

    # Greatest Elongation (Tangent point)
    # At greatest elongation of inferior planet, triangle Sun-Venus-Earth has right angle at Venus!
    # Distance Sun to Venus = r_inner = 2.0, Sun to Earth = r_earth = 3.5
    # Tangent from Earth(0, -r_earth) to circle x^2 + y^2 = r_inner^2:
    py = -(r_inner**2) / r_earth # -4.0 / 3.5 = -1.142857
    px = np.sqrt(r_inner**2 - py**2) # ~1.6413

    p_inner = patches.Circle((px, py), 0.18, color='coral', ec='brown', lw=2, zorder=5)
    ax.add_patch(p_inner)
    add_label_box(ax, 'Greatest\nElongation', px + 0.8, py + 0.3, color='brown', fontsize=9)

    # Line of sight from Earth to Inner Planet (tangent)
    ax.plot([ex, px], [ey, py], 'r-', lw=2, zorder=3)

    # Line from Sun to Inner Planet (90 degree at elongation)
    ax.plot([0, px], [0, py], 'k--', lw=1.5, zorder=3)

    # Line from Earth to Sun
    ax.plot([ex, 0], [ey, 0], 'b--', lw=1.5, zorder=3)

    # Right angle symbol at inner planet
    ax.text(px - 0.35, py - 0.25, '90°', color='red', fontweight='bold', fontsize=9.5)

    ax.set_xlim(-4.2, 4.2)
    ax.set_ylim(-4.5, 4.2)
    ax.set_title('Inferior Planet Positions & Greatest Elongation', fontsize=12, fontweight='bold', pad=10)

    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'astro1_q9_elongation.png'), dpi=150)
    plt.close()

def create_astro1_q18_hohmann():
    fig, ax = plt.subplots(figsize=(6, 5.5), dpi=150)
    ax.set_aspect('equal')
    ax.axis('off')

    # Central body (Sun/Earth)
    center = patches.Circle((0, 0), 0.35, color='gold', ec='darkorange', lw=2, zorder=5)
    ax.add_patch(center)
    ax.text(0, 0, 'Sun', ha='center', va='center', fontweight='bold', fontsize=9)

    r1 = 1.8
    r2 = 3.6
    # Orbit 1 (Inner)
    ax.add_patch(patches.Circle((0, 0), r1, color='blue', fill=False, ls='--', lw=1.5))
    ax.text(0, -r1 - 0.35, 'Inner Orbit ($r_1$)', color='blue', ha='center', fontweight='bold', fontsize=9)

    # Orbit 2 (Outer)
    ax.add_patch(patches.Circle((0, 0), r2, color='red', fill=False, ls='--', lw=1.5))
    ax.text(0, r2 + 0.35, 'Outer Orbit ($r_2$)', color='red', ha='center', fontweight='bold', fontsize=9)

    # Hohmann Transfer Ellipse
    # Perihelion at x = -r1 (-1.8), Aphelion at x = +r2 (+3.6)
    # Major axis length = r1 + r2 = 5.4 => semi-major axis a = 2.7
    # Center of ellipse = (r2 - r1)/2 = (+0.9, 0)
    a_trans = (r1 + r2) / 2.0 # 2.7
    c_trans = (r2 - r1) / 2.0 # 0.9 (center offset to the right)
    b_trans = np.sqrt(a_trans**2 - c_trans**2) # ~2.545

    ellipse = patches.Ellipse((c_trans, 0), 2*a_trans, 2*b_trans, color='green', fill=False, ls='-', lw=2.5, zorder=4)
    ax.add_patch(ellipse)

    # Direction arrow along top of transfer ellipse
    ax.annotate('', xy=(c_trans, b_trans), xytext=(c_trans - 0.5, b_trans),
                arrowprops=dict(arrowstyle="->", color="darkgreen", lw=2.5, mutation_scale=15))
    add_label_box(ax, r'Transfer Orbit ($a = \frac{r_1 + r_2}{2}$)', c_trans, b_trans + 0.45, color='darkgreen', fontsize=9.5)

    # Burn 1: perihelion (x = -r1, y = 0)
    ax.plot(-r1, 0, 'go', markersize=8, zorder=6)
    add_label_box(ax, r'Burn 1 ($\Delta v_1$)' + '\n(Perihelion)', -r1 - 0.3, -0.6, color='darkgreen', fontsize=9)

    # Burn 2: aphelion (x = r2, y = 0)
    ax.plot(r2, 0, 'go', markersize=8, zorder=6)
    add_label_box(ax, r'Burn 2 ($\Delta v_2$)' + '\n(Aphelion)', r2 + 0.3, -0.6, color='darkgreen', fontsize=9)

    ax.set_xlim(-4.2, 5.0)
    ax.set_ylim(-4.4, 4.6)
    ax.set_title('Hohmann Transfer Orbit (2 Impulse Burns)', fontsize=12, fontweight='bold', pad=10)

    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'astro1_q18_hohmann.png'), dpi=150)
    plt.close()

def create_astro1_q28_hr_diagram():
    fig, ax = plt.subplots(figsize=(7, 5), dpi=150)

    # Temperature array (log scale, reversed 38,000 K -> 2,100 K)
    T = np.logspace(np.log10(38000), np.log10(2100), 200)

    # Main sequence log-log curve fitting realistic stellar data using monotonic PCHIP interpolation (S-curve):
    T_pts = np.array([38000, 25000, 15000, 9500, 7200, 5778, 4500, 3500, 2800, 2100])
    logL_pts = np.array([5.0, 3.8, 2.5, 1.3, 0.5, 0.0, -0.9, -2.2, -3.2, -4.1])
    
    # Sort T_pts ascending for PchipInterpolator
    idx = np.argsort(T_pts)
    T_sorted = T_pts[idx]
    logL_sorted = logL_pts[idx]
    
    pchip = PchipInterpolator(np.log10(T_sorted), logL_sorted)
    logL_ms = pchip(np.log10(T))
    L_ms = 10**logL_ms

    # Main sequence band (shaded region representing width of Main Sequence)
    L_ms_upper = 10**(logL_ms + 0.35)
    L_ms_lower = 10**(logL_ms - 0.35)
    ax.fill_between(T, L_ms_lower, L_ms_upper, color='royalblue', alpha=0.25, label='Main Sequence Band')
    ax.plot(T, L_ms, color='blue', lw=2.5, label='Main Sequence Center')

    # Supergiants region (Class I) - Upper top band
    T_sg = np.logspace(np.log10(30000), np.log10(3000), 40)
    logL_sg = np.full_like(T_sg, 4.8) + 0.4 * np.sin(np.linspace(0, np.pi, 40))
    ax.fill_between(T_sg, 10**(logL_sg - 0.4), 10**(logL_sg + 0.5), color='crimson', alpha=0.18)
    ax.scatter([25000, 15000, 8000, 4000, 3200], [10**5, 10**4.8, 10**4.5, 10**4.7, 10**5],
               color='crimson', s=55, zorder=5)
    add_label_box(ax, 'Supergiants (Class I)', 7000, 10**5.2, color='crimson', fontsize=10)

    # Giants / Red Giants region (Class III) - Upper right
    T_g = np.logspace(np.log10(5200), np.log10(3000), 30)
    logL_g_center = 2.0 - 0.5 * (np.log10(T_g) - np.log10(4000))
    ax.fill_between(T_g, 10**(logL_g_center - 0.5), 10**(logL_g_center + 0.6), color='darkorange', alpha=0.22)
    ax.scatter([4800, 4200, 3600, 3200], [30, 80, 200, 500], color='darkorange', s=50, zorder=5)
    add_label_box(ax, 'Red Giants (Class III)', 3800, 150, color='darkorange', fontsize=10)

    # White Dwarfs region (Class VII) - Lower left
    T_wd = np.logspace(np.log10(25000), np.log10(7000), 30)
    logL_wd_center = -2.5 + 1.2 * (np.log10(T_wd) - np.log10(12000))
    ax.fill_between(T_wd, 10**(logL_wd_center - 0.5), 10**(logL_wd_center + 0.5), color='darkcyan', alpha=0.22)
    ax.scatter([22000, 16000, 11000, 8000], [0.03, 0.005, 0.001, 0.0002], color='darkcyan', s=45, zorder=5)
    add_label_box(ax, 'White Dwarfs (Class VII)', 14000, 0.0015, color='darkcyan', fontsize=9.5)

    # Sun position (G2V)
    ax.plot(5778, 1.0, 'y*', markersize=16, markeredgecolor='darkorange', zorder=8)
    add_label_box(ax, 'Sun (G2V)\nT=5778K, L=1.0', 5778, 3.5, color='darkgoldenrod', fontsize=9.5)

    # Axes scale & limits
    ax.set_xscale('log')
    ax.set_yscale('log')
    ax.set_xlim(38000, 2100) # Reversed temperature axis
    ax.set_ylim(1e-4, 1e6)

    ax.set_xlabel('Surface Temperature T (K)  ←  Hotter | Cooler  →', fontsize=11, fontweight='bold')
    ax.set_ylabel(r'Luminosity $L / L_\odot$ (Sun = 1)', fontsize=11, fontweight='bold')
    ax.set_title('Hertzsprung-Russell (H-R) Diagram', fontsize=13, fontweight='bold', pad=25)

    # Top axis for Spectral Types (O, B, A, F, G, K, M)
    ax_top = ax.twiny()
    ax_top.set_xscale('log')
    ax_top.set_xlim(38000, 2100)
    spectral_ticks = [35000, 18000, 8500, 6500, 5500, 4200, 2800]
    spectral_labels = ['O', 'B', 'A', 'F', 'G', 'K', 'M']
    ax_top.set_xticks(spectral_ticks)
    ax_top.set_xticklabels(spectral_labels, fontsize=10, fontweight='bold')
    ax_top.set_xlabel('Spectral Class', fontsize=11, fontweight='bold', labelpad=8)

    # Right axis for Absolute Magnitude M_V
    ax_right = ax.twinx()
    ax_right.set_yscale('log')
    ax_right.set_ylim(1e-4, 1e6)
    mv_ticks_L = [1e6, 1e4, 1e2, 1, 1e-2, 1e-4]
    mv_labels = ['-10', '-5', '0', '+5', '+10', '+15']
    ax_right.set_yticks(mv_ticks_L)
    ax_right.set_yticklabels(mv_labels, fontsize=9.5)
    ax_right.set_ylabel(r'Absolute Magnitude $M_V$', fontsize=11, fontweight='bold')

    ax.grid(True, which='both', linestyle=':', alpha=0.4)
    ax.legend(loc='lower right', fontsize=9)

    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'astro1_q28_hr_diagram.png'), dpi=150)
    plt.close()

def create_astro1_q39_rotation_curve():
    fig, ax = plt.subplots(figsize=(6, 4), dpi=150)
    r = np.linspace(0.1, 30, 200)

    # Observed flat curve
    v_obs = 220 * (1 - np.exp(-r / 3.0))

    # Expected Keplerian curve (v ~ 1/sqrt(r))
    v_kep = np.where(r < 5, 220 * (r / 5.0), 220 * np.sqrt(5.0 / r))

    ax.plot(r, v_obs, 'r-', lw=2.8, label='Observed (Flat Curve)')
    ax.plot(r, v_kep, 'b--', lw=2.0, label=r'Expected Keplerian ($v \propto 1/\sqrt{r}$)')

    ax.fill_between(r, v_kep, v_obs, color='crimson', alpha=0.15, label='Dark Matter Contribution')

    ax.set_xlabel('Distance from Galactic Center (kpc)', fontsize=11, fontweight='bold')
    ax.set_ylabel('Orbital Velocity v (km/s)', fontsize=11, fontweight='bold')
    ax.set_title('Galaxy Rotation Curve & Dark Matter Halo', fontsize=12, fontweight='bold', pad=10)
    ax.set_xlim(0, 30)
    ax.set_ylim(0, 260)
    ax.grid(True, linestyle=':', alpha=0.6)
    ax.legend(loc='lower right', fontsize=10)

    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'astro1_q39_rotation_curve.png'), dpi=150)
    plt.close()

def create_astro1_q47_light_curve():
    fig, ax = plt.subplots(figsize=(6.5, 4), dpi=150)
    t = np.linspace(0, 10, 300)

    # Baseline brightness
    b = np.full_like(t, 1.0)
    # Primary eclipse at t=2.5 (deep drop: cold star eclipses hot star)
    b -= 0.6 * np.exp(-((t - 2.5) / 0.4)**2)
    # Secondary eclipse at t=7.5 (shallow drop: hot star eclipses cold star)
    b -= 0.2 * np.exp(-((t - 7.5) / 0.4)**2)

    ax.plot(t, b, 'indigo', lw=2.5)
    ax.plot(2.5, 0.4, 'ro', markersize=7)
    add_label_box(ax, 'Primary Minimum\n(Cold star eclipses Hot star)', 2.5, 0.22, color='crimson', fontsize=9)

    ax.plot(7.5, 0.8, 'bo', markersize=7)
    add_label_box(ax, 'Secondary Minimum\n(Hot star eclipses Cold star)', 7.5, 0.65, color='darkblue', fontsize=9)

    ax.set_xlabel('Time (Orbital Phase)', fontsize=11, fontweight='bold')
    ax.set_ylabel('Apparent Brightness (Relative)', fontsize=11, fontweight='bold')
    ax.set_title('Eclipsing Binary Light Curve', fontsize=12, fontweight='bold', pad=10)
    ax.set_xlim(0, 10)
    ax.set_ylim(0.1, 1.15)
    ax.grid(True, linestyle=':', alpha=0.6)

    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'astro1_q47_light_curve.png'), dpi=150)
    plt.close()

def create_astro1_q49_spring_tide():
    fig, ax = plt.subplots(figsize=(6.5, 4), dpi=150)
    ax.set_aspect('equal')
    ax.axis('off')

    # Sun far left / right indicator
    ax.text(4.2, 0, 'Sunlight\n➔', ha='center', va='center', fontweight='bold', color='darkorange', fontsize=11)

    # Earth center
    ax.add_patch(patches.Circle((0, 0), 1.0, color='deepskyblue', ec='navy', lw=2, zorder=5))
    ax.text(0, 0, 'Earth', ha='center', va='center', fontweight='bold', color='white', fontsize=10)

    # Tidal bulge (elliptical) in line with Sun
    bulge = patches.Ellipse((0, 0), 2.8, 2.2, color='skyblue', alpha=0.4, zorder=3)
    ax.add_patch(bulge)
    ax.text(0, 1.3, 'High Tide Bulge', ha='center', color='blue', fontweight='bold', fontsize=9)

    # Moon at New Moon (Right)
    m_new = patches.Circle((2.5, 0), 0.3, color='lightgray', ec='black', lw=1.5, zorder=6)
    ax.add_patch(m_new)
    ax.text(2.5, -0.55, 'New Moon\n(Spring Tide)', ha='center', va='top', fontweight='bold', fontsize=9, color='darkgreen')

    # Moon at Full Moon (Left)
    m_full = patches.Circle((-2.5, 0), 0.3, color='yellow', ec='darkgoldenrod', lw=1.5, zorder=6)
    ax.add_patch(m_full)
    ax.text(-2.5, -0.55, 'Full Moon\n(Spring Tide)', ha='center', va='top', fontweight='bold', fontsize=9, color='darkgreen')

    ax.set_xlim(-3.8, 5.0)
    ax.set_ylim(-2.5, 2.5)
    ax.set_title('Spring Tide Alignment (Sun - Earth - Moon Linear)', fontsize=12, fontweight='bold', pad=10)

    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'astro1_q49_spring_tide.png'), dpi=150)
    plt.close()

# Generate ALL diagrams!
print("Generating physics and astronomy diagrams...")
create_ch3_1_scenario1()
create_ch3_1_scenario2()
create_ch3_1_scenario3()

create_ch3_re1_scenario3()
create_ch3_re1_scenario4()

create_ch3_5_q5()
create_ch3_5_q7()
create_ch3_5_q14()
create_ch3_5_q18()
create_ch3_5_q19()
create_ch3_5_q21()
create_ch3_5_q23()
create_ch3_5_q29()

create_ch3_6_q2()
create_ch3_6_q6()
create_ch3_6_q10()
create_ch3_6_q13()
create_ch3_6_q15()
create_ch3_6_q18()
create_ch3_6_q22()
create_ch3_6_q26()

# Astro1 diagrams
create_astro1_q9_elongation()
create_astro1_q18_hohmann()
create_astro1_q28_hr_diagram()
create_astro1_q39_rotation_curve()
create_astro1_q47_light_curve()
create_astro1_q49_spring_tide()

print("ALL DIAGRAMS PERFECTLY GENERATED!")

