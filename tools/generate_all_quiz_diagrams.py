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

def text_clean(ax, x, y, s, color='black', fontsize=9.5, ha='center', va='center', fontweight='bold', bg='white', pad=0.25):
    ax.text(x, y, s, color=color, fontsize=fontsize, ha=ha, va=va, fontweight=fontweight,
            bbox=dict(boxstyle=f'round,pad={pad}', facecolor=bg, edgecolor='none', alpha=0.92), zorder=10)

# ==========================================
# DIAGRAMS FOR Astro2-data.js
# ==========================================

def create_astro2_q5_circumpolar():
    fig, ax = plt.subplots(figsize=(7.2, 5.6), dpi=150)
    ax.set_aspect('equal')
    ax.axis('off')

    R = 3.2

    # 1. Background Sky Arc
    theta = np.linspace(0, np.pi, 200)
    ax.plot(R * np.cos(theta), R * np.sin(theta), color='#1E293B', ls='-', lw=2, zorder=1)

    # 2. Horizon Line
    ax.plot([-R*1.15, R*1.15], [0, 0], color='#334155', lw=2.5, zorder=2)
    ax.fill_between([-R*1.15, R*1.15], 0, -0.45, color='#F8FAFC', zorder=0)

    # Observer at center O
    ax.plot(0, 0, 'o', color='#0F172A', markersize=6, zorder=6)
    text_clean(ax, 0, -0.28, 'O', color='#0F172A', fontsize=11)

    # Cardinal Points & Zenith
    text_clean(ax, -R*1.08, -0.28, 'N', color='#1E3A8A', fontsize=12)
    text_clean(ax, R*1.08, -0.28, 'S', color='#1E3A8A', fontsize=12)
    text_clean(ax, 0, R*1.08, 'Z', color='#065F46', fontsize=12)

    # Latitude L = 30°
    L = 30
    ncp_angle_deg = 180 - L  # 150°
    ncp_rad = np.radians(ncp_angle_deg)
    ncp_x, ncp_y = R * np.cos(ncp_rad), R * np.sin(ncp_rad)

    # 3. NCP Line
    ax.plot([0, ncp_x], [0, ncp_y], color='#2563EB', lw=2, zorder=3)
    ax.plot(ncp_x, ncp_y, 'o', color='#2563EB', markersize=7, zorder=6)
    text_clean(ax, ncp_x - 0.3, ncp_y + 0.25, 'NCP', color='#1D4ED8', fontsize=11, ha='right')

    # Latitude Arc L
    arc_l = patches.Arc((0, 0), 1.6, 1.6, angle=0, theta1=150, theta2=180, color='#2563EB', lw=1.5, zorder=3)
    ax.add_patch(arc_l)
    text_clean(ax, -1.05, 0.22, r'$L$', color='#1D4ED8', fontsize=10, pad=0.15)

    # 4. Celestial Equator (CE) (Alt = 60° S)
    ce_angle_deg = 60
    ce_rad = np.radians(ce_angle_deg)
    ce_x, ce_y = R * np.cos(ce_rad), R * np.sin(ce_rad)
    ax.plot([-ce_x, ce_x], [-ce_y, ce_y], color='#DC2626', ls='--', lw=1.8, zorder=2)
    ax.plot(ce_x, ce_y, 'ro', markersize=5, zorder=5)
    text_clean(ax, ce_x + 0.35, ce_y + 0.15, r'CE ($\delta = 0^\circ$)', color='#B91C1C', fontsize=10, ha='left')

    # 5. Star with δ = +75° (θ_p = 15°)
    delta = 75
    theta_p = 90 - delta  # 15°

    lower_angle_deg = 180 - (L - theta_p)  # 165°
    upper_angle_deg = 180 - (L + theta_p)  # 135°

    lower_rad = np.radians(lower_angle_deg)
    upper_rad = np.radians(upper_angle_deg)

    sl_x, sl_y = R * np.cos(lower_rad), R * np.sin(lower_rad)
    su_x, su_y = R * np.cos(upper_rad), R * np.sin(upper_rad)

    # Plot Star Points
    ax.plot(sl_x, sl_y, '*', color='#D97706', markersize=14, markeredgecolor='#B45309', zorder=7)
    ax.plot(su_x, su_y, '*', color='#D97706', markersize=14, markeredgecolor='#B45309', zorder=7)

    # Sight lines to star transits
    ax.plot([0, sl_x], [0, sl_y], color='#D97706', ls=':', lw=1.2, zorder=2)
    ax.plot([0, su_x], [0, su_y], color='#D97706', ls=':', lw=1.2, zorder=2)

    # Golden Arc along Meridian
    star_arc_angles = np.linspace(upper_rad, lower_rad, 100)
    ax.plot(R * np.cos(star_arc_angles), R * np.sin(star_arc_angles), color='#F59E0B', lw=4.5, zorder=4)

    # Transit Labels
    text_clean(ax, sl_x - 0.35, sl_y + 0.22, 'Lower Transit', color='#B45309', fontsize=9.5, ha='right')
    text_clean(ax, su_x - 0.35, su_y + 0.25, 'Upper Transit', color='#B45309', fontsize=9.5, ha='right')

    # Polar distance arcs 90° - δ
    arc_p1 = patches.Arc((0, 0), 2.2, 2.2, angle=0, theta1=150, theta2=165, color='#D97706', lw=1.5, zorder=3)
    arc_p2 = patches.Arc((0, 0), 2.2, 2.2, angle=0, theta1=135, theta2=150, color='#D97706', lw=1.5, zorder=3)
    ax.add_patch(arc_p1)
    ax.add_patch(arc_p2)

    text_clean(ax, -1.25, 0.52, r'$90^\circ - \delta$', color='#B45309', fontsize=8.5, pad=0.15)
    text_clean(ax, -0.92, 1.02, r'$90^\circ - \delta$', color='#B45309', fontsize=8.5, pad=0.15)

    # Highlight Minimum Altitude Alt_min = L - (90° - δ) > 0°
    ax.annotate('', xy=(sl_x, sl_y), xytext=(-R, 0),
                arrowprops=dict(arrowstyle='<->', color='#059669', lw=2.2))
    text_clean(ax, sl_x + 0.55, 0.28, r'$Alt_{\min} = L - (90^\circ - \delta) > 0^\circ$', color='#047857', fontsize=9.5, ha='left')

    ax.set_xlim(-R*1.45, R*1.45)
    ax.set_ylim(-0.6, R*1.22)
    ax.set_title('Circumpolar Condition on Celestial Meridian', fontsize=11, fontweight='bold', color='#0F172A', pad=12)

    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'astro2_q5_circumpolar.png'), dpi=150)
    plt.close()

def create_astro2_q7_third_quarter():
    fig, ax = plt.subplots(figsize=(6, 5.5), dpi=150)
    ax.set_aspect('equal')
    ax.axis('off')

    # Sunlight direction
    ax.text(3.8, 0, 'Sunlight\n➔', ha='center', va='center', fontweight='bold', color='darkorange', fontsize=11)

    # Earth center
    ax.add_patch(patches.Circle((0, 0), 1.0, color='deepskyblue', ec='navy', lw=2, zorder=5))
    ax.text(0, 0, 'Earth\n(Rotation ↺)', ha='center', va='center', fontweight='bold', color='white', fontsize=9)

    # Moon Orbit
    r_moon = 2.5
    ax.add_patch(patches.Circle((0, 0), r_moon, color='gray', fill=False, ls='--', lw=1.5))

    # Third Quarter Moon (Top) - Ram 8 Kham
    mq3 = patches.Circle((0, r_moon), 0.3, color='lightgray', ec='black', lw=1.5, zorder=6)
    ax.add_patch(mq3)
    wedge = patches.Wedge((0, r_moon), 0.3, 90, 270, color='dimgray', zorder=7)
    ax.add_patch(wedge)
    add_label_box(ax, 'Third Quarter (Waning Half)\nRise: Midnight (00:00)\nTransit: 06:00 | Set: 12:00', 0, r_moon + 0.65, color='purple', fontsize=9)

    # First Quarter Moon (Bottom) - Khuen 8 Kham
    mq1 = patches.Circle((0, -r_moon), 0.3, color='lightgray', ec='black', lw=1.5, zorder=6)
    ax.add_patch(mq1)
    wedge1 = patches.Wedge((0, -r_moon), 0.3, 90, 270, color='dimgray', zorder=7)
    ax.add_patch(wedge1)
    add_label_box(ax, 'First Quarter (Waxing Half)\nRise: 12:00 | Transit: 18:00\nSet: Midnight (00:00)', 0, -r_moon - 0.65, color='darkblue', fontsize=9)

    # Observer times on Earth surface
    ax.text(0, 1.2, 'Midnight\n(00:00)', ha='center', va='bottom', fontweight='bold', fontsize=8.5, color='navy')
    ax.text(0, -1.2, 'Noon\n(12:00)', ha='center', va='top', fontweight='bold', fontsize=8.5, color='darkgoldenrod')
    ax.text(-1.2, 0, 'Sunrise\n(06:00)', ha='right', va='center', fontweight='bold', fontsize=8.5, color='darkgreen')
    ax.text(1.2, 0, 'Sunset\n(18:00)', ha='left', va='center', fontweight='bold', fontsize=8.5, color='crimson')

    ax.set_xlim(-3.8, 4.8)
    ax.set_ylim(-3.8, 3.8)
    ax.set_title('Moon Phases & Observer Local Times', fontsize=12, fontweight='bold', pad=10)

    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'astro2_q7_third_quarter.png'), dpi=150)
    plt.close()

def create_astro2_q9_opposition():
    fig, ax = plt.subplots(figsize=(6.5, 3.5), dpi=150)
    ax.set_aspect('equal')
    ax.axis('off')

    # Sun
    sun = patches.Circle((0, 0), 0.35, color='gold', ec='orange', lw=2, zorder=5)
    ax.add_patch(sun)
    ax.text(0, 0, 'Sun', ha='center', va='center', fontweight='bold', fontsize=9)

    # Orbits
    r_earth = 1.8
    r_mars = 3.6
    ax.add_patch(patches.Circle((0, 0), r_earth, color='royalblue', fill=False, ls=':', lw=1.5))
    ax.add_patch(patches.Circle((0, 0), r_mars, color='crimson', fill=False, ls='--', lw=1.5))

    # Earth
    ex, ey = r_earth, 0
    earth = patches.Circle((ex, ey), 0.22, color='deepskyblue', ec='navy', lw=2, zorder=5)
    ax.add_patch(earth)
    ax.text(ex, ey - 0.45, 'Earth', ha='center', va='top', fontweight='bold', fontsize=9.5, color='navy')

    # Outer Planet (Opposition)
    px, py = r_mars, 0
    planet = patches.Circle((px, py), 0.25, color='coral', ec='firebrick', lw=2, zorder=5)
    ax.add_patch(planet)
    add_label_box(ax, 'Outer Planet\n(Opposition)', px, py + 0.65, color='firebrick', fontsize=9.5)

    # Alignment line Sun-Earth-Planet
    ax.plot([-0.5, r_mars + 0.6], [0, 0], 'r--', lw=1.8, zorder=3)

    # Notes
    add_label_box(ax, r'$180^\circ$ opposite to Sun' + '\nClosest to Earth & Brightest!\nRises at Sunset, Sets at Sunrise', 1.8, -1.4, color='darkred', fontsize=9)

    ax.set_xlim(-0.8, 4.8)
    ax.set_ylim(-2.2, 1.8)
    ax.set_title('Outer Planet at Opposition', fontsize=12, fontweight='bold', pad=10)

    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'astro2_q9_opposition.png'), dpi=150)
    plt.close()

def create_astro2_q12_eastern_elongation():
    fig, ax = plt.subplots(figsize=(6, 5), dpi=150)
    ax.set_aspect('equal')
    ax.axis('off')

    # Sun
    sun = patches.Circle((0, 0), 0.35, color='gold', ec='orange', lw=2, zorder=5)
    ax.add_patch(sun)
    ax.text(0, 0, 'Sun', ha='center', va='center', fontweight='bold', fontsize=9)

    r_inner = 1.8
    r_earth = 3.2

    ax.add_patch(patches.Circle((0, 0), r_inner, color='gray', fill=False, ls='--', lw=1.5))
    ax.add_patch(patches.Circle((0, 0), r_earth, color='royalblue', fill=False, ls=':', lw=1.5))

    # Earth at bottom
    ex, ey = 0, -r_earth
    earth = patches.Circle((ex, ey), 0.22, color='deepskyblue', ec='navy', lw=2, zorder=5)
    ax.add_patch(earth)
    ax.text(ex, ey - 0.45, 'Earth', ha='center', va='top', fontweight='bold', fontsize=10, color='navy')

    # Greatest Eastern Elongation (Right side / East of Sun)
    py = -(r_inner**2) / r_earth # -1.8^2 / 3.2 = -1.0125
    px = np.sqrt(r_inner**2 - py**2) # ~1.488

    venus = patches.Circle((px, py), 0.2, color='sandybrown', ec='saddlebrown', lw=2, zorder=5)
    ax.add_patch(venus)
    add_label_box(ax, 'Greatest Eastern Elongation\n(Venus in Evening Sky / West)', px + 0.8, py + 0.3, color='saddlebrown', fontsize=8.5)

    # Tangent line of sight
    ax.plot([ex, px], [ey, py], 'r-', lw=2, zorder=3)
    ax.plot([0, px], [0, py], 'k--', lw=1.5, zorder=3)
    ax.plot([ex, 0], [ey, 0], 'b--', lw=1.5, zorder=3)

    # Evening observer note
    add_label_box(ax, 'At Sunset (18:00), Sun sets in West,\nVenus remains above Western horizon!', -1.2, -1.8, color='darkgreen', fontsize=8.5)

    ax.set_xlim(-3.2, 4.2)
    ax.set_ylim(-4.2, 2.5)
    ax.set_title('Greatest Eastern Elongation (Evening Star)', fontsize=12, fontweight='bold', pad=10)

    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'astro2_q12_eastern_elongation.png'), dpi=150)
    plt.close()

def create_astro2_q16_conic_sections():
    fig, ax = plt.subplots(figsize=(6.5, 4.5), dpi=150)
    ax.set_aspect('equal')

    # Focus (Sun / Earth) at origin
    sun = patches.Circle((0, 0), 0.2, color='gold', ec='orange', lw=1.5, zorder=6)
    ax.add_patch(sun)
    ax.text(0, -0.4, 'Focus ($M$)', ha='center', va='top', fontweight='bold', fontsize=9.5)

    # Periapsis distance rp = 1.0 at x = +1.0, y = 0
    rp = 1.0
    ax.plot(rp, 0, 'ko', markersize=5, zorder=6)

    # 1. Circle (e = 0, E < 0)
    circle = patches.Circle((0, 0), rp, color='blue', fill=False, ls='-', lw=2, label='Circle ($e = 0, E < 0$)')
    ax.add_patch(circle)

    # 2. Ellipse (e = 0.6, E < 0)
    ellipse = patches.Ellipse((-1.5, 0), 5.0, 4.0, color='green', fill=False, ls='--', lw=2, label='Ellipse ($0 < e < 1, E < 0$)')
    ax.add_patch(ellipse)

    # 3. Parabola (e = 1.0, E = 0)
    y_p = np.linspace(-3.2, 3.2, 100)
    x_p = 1.0 - (y_p**2)/4.0
    ax.plot(x_p, y_p, color='crimson', ls='-', lw=2.2, label='Parabola ($e = 1, E = 0$)')

    # 4. Hyperbola (e = 1.5, E > 0)
    y_h = np.linspace(-3.5, 3.5, 100)
    x_h = 1.0 - (y_h**2)/2.2
    ax.plot(x_h, y_h, color='purple', ls=':', lw=2.2, label='Hyperbola ($e > 1, E > 0$)')

    ax.set_xlim(-4.2, 2.2)
    ax.set_ylim(-3.6, 3.6)
    ax.set_xlabel('$x$', fontsize=11)
    ax.set_ylabel('$y$', fontsize=11)
    ax.set_title('Conic Section Orbits & Energy States', fontsize=12, fontweight='bold', pad=10)
    ax.grid(True, linestyle=':', alpha=0.5)
    ax.legend(loc='upper left', fontsize=9)

    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'astro2_q16_conic_sections.png'), dpi=150)
    plt.close()

def create_astro2_q23_parallax():
    fig, ax = plt.subplots(figsize=(6, 5), dpi=150)
    ax.set_aspect('equal')
    ax.axis('off')

    # Sun
    sun = patches.Circle((0, 0), 0.25, color='gold', ec='orange', lw=2, zorder=5)
    ax.add_patch(sun)
    ax.text(0, 0, 'Sun', ha='center', va='center', fontweight='bold', fontsize=8.5)

    # Earth positions (Jan & July, 6 months apart)
    r_e = 2.2
    e1 = patches.Circle((-r_e, 0), 0.18, color='deepskyblue', ec='navy', lw=2, zorder=5)
    e2 = patches.Circle((r_e, 0), 0.18, color='deepskyblue', ec='navy', lw=2, zorder=5)
    ax.add_patch(e1)
    ax.add_patch(e2)
    ax.text(-r_e, -0.45, 'Earth (Jan)', ha='center', va='top', fontweight='bold', fontsize=9)
    ax.text(r_e, -0.45, 'Earth (July)', ha='center', va='top', fontweight='bold', fontsize=9)
    ax.plot([-r_e, r_e], [0, 0], 'k--', lw=1.2)
    add_label_box(ax, 'Baseline = 2 AU', 0, -0.45, color='black', fontsize=8.5)

    # Target Nearby Star
    star_y = 3.8
    star = patches.Circle((0, star_y), 0.15, color='yellow', ec='darkorange', lw=2, zorder=6)
    ax.add_patch(star)
    add_label_box(ax, 'Nearby Star', 0.85, star_y, color='darkorange', fontsize=9.5)

    # Sight lines forming triangle
    ax.plot([-r_e, 0], [0, star_y], 'r-', lw=1.8)
    ax.plot([r_e, 0], [0, star_y], 'r-', lw=1.8)
    ax.plot([0, 0], [0, star_y], 'k:', lw=1.2)

    # Parallax angle p
    arc = patches.Arc((0, star_y), 1.0, 1.0, angle=0, theta1=270 - np.degrees(np.arctan(r_e/star_y)), theta2=270, color='purple', lw=1.5)
    ax.add_patch(arc)
    add_label_box(ax, r'$p$ (Parallax Angle)', -0.85, star_y - 0.7, color='purple', fontsize=9)

    # Formula box
    add_label_box(ax, r'$d = \frac{1}{p\text{ (arcsec)}}\text{ pc}$' + '\n' + r'Larger $p \Rightarrow$ Closer distance!', 0, star_y + 0.8, color='darkblue', fontsize=9.5)

    ax.set_xlim(-3.2, 3.2)
    ax.set_ylim(-1.0, 5.2)
    ax.set_title('Stellar Parallax Geometry', fontsize=12, fontweight='bold', pad=10)

    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'astro2_q23_parallax.png'), dpi=150)
    plt.close()

def create_astro2_q46_orbit_change():
    fig, ax = plt.subplots(figsize=(6, 5), dpi=150)
    ax.set_aspect('equal')
    ax.axis('off')

    earth = patches.Circle((0, 0), 1.0, color='deepskyblue', ec='navy', lw=2, zorder=5)
    ax.add_patch(earth)
    ax.text(0, 0, 'Earth', ha='center', va='center', fontweight='bold', color='white', fontsize=10)

    r_circ = 2.5
    circ_orbit = patches.Circle((0, 0), r_circ, color='blue', fill=False, ls='--', lw=1.8)
    ax.add_patch(circ_orbit)
    ax.text(-r_circ - 0.2, 0, 'Initial Circular Orbit', color='blue', ha='right', fontweight='bold', fontsize=8.5)

    sat_x, sat_y = 0, r_circ
    sat = patches.Rectangle((sat_x - 0.2, sat_y - 0.15), 0.4, 0.3, color='orange', ec='darkred', lw=1.5, zorder=6)
    ax.add_patch(sat)

    ax.annotate('', xy=(-0.8, sat_y), xytext=(0, sat_y),
                arrowprops=dict(arrowstyle="->", color="crimson", lw=2.5))
    add_label_box(ax, r'Retrograde Burn ($\Delta v < 0$)', 0.8, sat_y + 0.4, color='crimson', fontsize=8.5)

    ellipse_new = patches.Ellipse((0, 0.6), 2 * 1.8028, 2 * 1.9, color='crimson', fill=False, ls='-', lw=2.2, zorder=4)
    ax.add_patch(ellipse_new)

    add_label_box(ax, 'Burn Point becomes APOGEE!\nNew Elliptical Orbit (Smaller)', 0, -1.8, color='darkred', fontsize=9)

    ax.set_xlim(-3.2, 3.2)
    ax.set_ylim(-2.5, 3.8)
    ax.set_title('Effect of Velocity Reduction in Orbit', fontsize=12, fontweight='bold', pad=10)

    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'astro2_q46_orbit_change.png'), dpi=150)
    plt.close()

# ==========================================
# DIAGRAMS FOR Astro3-data.js
# ==========================================

def create_astro3_q6_visibility():
    fig, ax = plt.subplots(figsize=(7, 5.2), dpi=150)
    ax.set_aspect('equal')
    ax.axis('off')
    R = 3.2
    theta = np.linspace(0, np.pi, 200)
    ax.plot(R * np.cos(theta), R * np.sin(theta), color='#1E293B', ls='-', lw=2, zorder=1)
    ax.plot([-R*1.15, R*1.15], [0, 0], color='#334155', lw=2.5, zorder=2)
    ax.fill_between([-R*1.15, R*1.15], 0, -0.6, color='#F8FAFC', zorder=0)

    text_clean(ax, 0, -0.28, 'O', color='#0F172A', fontsize=11)
    text_clean(ax, -R*1.08, -0.28, 'N', color='#1E3A8A', fontsize=12)
    text_clean(ax, R*1.08, -0.28, 'S', color='#1E3A8A', fontsize=12)
    text_clean(ax, 0, R*1.08, 'Z', color='#065F46', fontsize=12)

    L = 34
    ncp_rad = np.radians(180 - L)
    ncp_x, ncp_y = R * np.cos(ncp_rad), R * np.sin(ncp_rad)
    ax.plot([0, ncp_x], [0, ncp_y], color='#2563EB', lw=2, zorder=3)
    ax.plot(ncp_x, ncp_y, 'o', color='#2563EB', markersize=7, zorder=6)
    text_clean(ax, ncp_x - 0.3, ncp_y + 0.25, r'NCP ($Alt = 34^\circ$)', color='#1D4ED8', fontsize=10, ha='right')

    ce_rad = np.radians(90 - L)  # 56° S
    ce_x, ce_y = R * np.cos(ce_rad), R * np.sin(ce_rad)
    ax.plot([-ce_x, ce_x], [-ce_y, ce_y], color='#DC2626', ls='--', lw=1.8, zorder=2)
    text_clean(ax, ce_x + 0.35, ce_y + 0.15, r'CE ($Alt = 56^\circ\text{ S}$)', color='#B91C1C', fontsize=10, ha='left')

    # Star Achernar (dec = -57°) -> Max Alt = 90 - 34 - 57 = -1° (Below horizon!)
    star_rad = np.radians(-(57 - (90 - L)))
    star_x, star_y = R * np.cos(star_rad), R * np.sin(star_rad)
    ax.plot(star_x, star_y, '*', color='#7C3AED', markersize=14, markeredgecolor='#5B21B6', zorder=7)
    text_clean(ax, star_x + 0.3, star_y - 0.25, r'Achernar ($\delta = -57^\circ$)' + '\n' + r'$Alt_{\max} = -1^\circ$ (Below Horizon!)', color='#6D28D9', fontsize=9.5, ha='center')

    ax.set_xlim(-R*1.45, R*1.45)
    ax.set_ylim(-0.8, R*1.22)
    ax.set_title(r'Celestial Meridian Geometry: Star Below Horizon (Lat $34^\circ$ N)', fontsize=11, fontweight='bold', pad=12)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'astro3_q6_visibility.png'), dpi=150)
    plt.close()

def create_astro3_q8_ellipse_velocities():
    fig, ax = plt.subplots(figsize=(7.2, 4.8), dpi=150)
    ax.set_aspect('equal')
    ax.axis('off')

    a, e = 3.0, 0.5
    b = a * np.sqrt(1 - e**2)
    c = a * e
    t = np.linspace(0, 2*np.pi, 200)

    # Ellipse path
    ax.plot(a*np.cos(t), b*np.sin(t), color='#2563EB', lw=2, zorder=2)

    # Major axis line
    ax.plot([-a, a], [0, 0], color='#94A3B8', ls='--', lw=1.2, zorder=1)

    # Sun at focus (-c, 0)
    ax.plot(-c, 0, 'o', color='#F59E0B', markersize=14, markeredgecolor='#B45309', zorder=6)
    text_clean(ax, -c, -0.55, 'Sun', color='#B45309', fontsize=10)

    # Perihelion & Aphelion points
    rp_x, rp_y = -a, 0
    ra_x, ra_y = a, 0
    ax.plot(rp_x, rp_y, 'ro', markersize=7, zorder=6)
    ax.plot(ra_x, ra_y, 'go', markersize=7, zorder=6)

    # Clean short labels outside the ellipse
    text_clean(ax, rp_x - 0.7, 0, 'Perihelion\n($r_p$)', color='#B91C1C', fontsize=10, ha='right')
    text_clean(ax, ra_x + 0.7, 0, 'Aphelion\n($r_a$)', color='#047857', fontsize=10, ha='left')

    # Arrows showing r_p and r_a distances
    ax.annotate('', xy=(-c, 0.5), xytext=(rp_x, 0.5), arrowprops=dict(arrowstyle='<->', color='#B91C1C', lw=1.5))
    text_clean(ax, (-c + rp_x)/2, 0.9, '$r_p$', color='#B91C1C', fontsize=9.5, pad=0.15)

    ax.annotate('', xy=(-c, 0.5), xytext=(ra_x, 0.5), arrowprops=dict(arrowstyle='<->', color='#047857', lw=1.5))
    text_clean(ax, (-c + ra_x)/2, 0.9, '$r_a$', color='#047857', fontsize=9.5, pad=0.15)

    ax.set_xlim(-a*1.55, a*1.55)
    ax.set_ylim(-b*1.5, b*1.5)
    ax.set_title('Elliptical Orbit Geometry: Perihelion ($r_p$) & Aphelion ($r_a$)', fontsize=11, fontweight='bold', color='#0F172A', pad=12)

    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'astro3_q8_ellipse_velocities.png'), dpi=150)
    plt.close()

def create_astro3_q11_redshift():
    fig, ax = plt.subplots(figsize=(7.5, 4.2), dpi=150)
    ax.axis('off')
    ax.add_patch(patches.Rectangle((0, 2.2), 10, 0.8, color='#0284C7', alpha=0.35))
    ax.plot([0, 10], [2.2, 2.2], 'k-', lw=1)
    ax.plot([0, 10], [3.0, 3.0], 'k-', lw=1)
    ax.plot([2.0, 2.0], [2.2, 3.0], color='#0F172A', lw=3.5, zorder=5)
    text_clean(ax, -0.3, 2.6, 'Laboratory Rest Spectrum', color='#0369A1', fontsize=9.5, ha='right')
    text_clean(ax, 2.0, 3.3, r'$\lambda_0 = 486\text{ nm}$ (Cyan)', color='#0F172A', fontsize=9, ha='center')

    ax.add_patch(patches.Rectangle((0, 0.5), 10, 0.8, color='#DC2626', alpha=0.35))
    ax.plot([0, 10], [0.5, 0.5], 'k-', lw=1)
    ax.plot([0, 10], [1.3, 1.3], 'k-', lw=1)
    ax.plot([8.0, 8.0], [0.5, 1.3], color='#0F172A', lw=3.5, zorder=5)
    text_clean(ax, -0.3, 0.9, 'Distant Galaxy Spectrum', color='#B91C1C', fontsize=9.5, ha='right')
    text_clean(ax, 8.0, 0.2, r'$\lambda = 1944\text{ nm}$ (Redshifted)', color='#0F172A', fontsize=9, ha='center')

    ax.annotate('', xy=(8.0, 1.3), xytext=(2.0, 2.2),
                arrowprops=dict(arrowstyle='->', color='#DC2626', lw=2.5, ls='--'))
    text_clean(ax, 5.0, 1.8, r'Redshift $z = \frac{\lambda - \lambda_0}{\lambda_0} = \frac{1944 - 486}{486} = 3$', color='#991B1B', fontsize=9.5)

    ax.set_xlim(-3.2, 11)
    ax.set_ylim(-0.2, 3.8)
    ax.set_title('Cosmological Redshift of Galaxy Absorption Line', fontsize=11, fontweight='bold', pad=12)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'astro3_q11_redshift.png'), dpi=150)
    plt.close()

def create_astro3_q23_prograde_burn():
    fig, ax = plt.subplots(figsize=(7, 5), dpi=150)
    ax.set_aspect('equal')
    ax.axis('off')

    ax.plot(0, 0, 'o', color='#0284C7', markersize=14, markeredgecolor='#0369A1', zorder=6)
    text_clean(ax, 0, -0.4, 'Earth', color='#0369A1', fontsize=9.5)

    r_c = 2.0
    circle = patches.Circle((0, 0), r_c, color='#0284C7', fill=False, ls='--', lw=1.8, zorder=2)
    ax.add_patch(circle)

    burn_x, burn_y = r_c, 0
    ax.plot(burn_x, burn_y, '*', color='#F59E0B', markersize=14, markeredgecolor='#B45309', zorder=7)
    text_clean(ax, burn_x + 0.35, burn_y + 0.45, 'Perigee (Burn Point)\n' + r'Prograde Boost ($+\Delta v$)', color='#B45309', fontsize=9.5, ha='left')

    a_new = (r_c + 3.8) / 2
    c_new = a_new - r_c
    b_new = np.sqrt(a_new**2 - c_new**2)
    t = np.linspace(0, 2*np.pi, 200)
    ax.plot(-c_new + a_new*np.cos(t), b_new*np.sin(t), color='#DC2626', lw=2.2, zorder=3)

    apogee_x = -3.8
    ax.plot(apogee_x, 0, 'ro', markersize=6, zorder=6)
    text_clean(ax, apogee_x - 0.35, 0.45, 'New Apogee (Higher!)', color='#B91C1C', fontsize=9.5, ha='right')

    ax.set_xlim(-4.8, 3.8)
    ax.set_ylim(-2.8, 2.8)
    ax.set_title('Orbit Transfer: Prograde Burn at Perigee Raises Apogee', fontsize=11, fontweight='bold', pad=12)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'astro3_q23_prograde_burn.png'), dpi=150)
    plt.close()

def create_astro3_q25_q35_stellar_interiors():
    fig, ax = plt.subplots(figsize=(8.2, 4.2), dpi=150)
    ax.set_aspect('equal')
    ax.axis('off')

    c1 = patches.Circle((-3.0, 0), 1.0, color='#FCA5A5', ec='#DC2626', lw=2)
    ax.add_patch(c1)
    text_clean(ax, -3.0, -1.45, r'Low-Mass Star ($M < 0.35 M_\odot$)' + '\n' + r'Fully Convective Core & Envelope' + '\n' + r'(p-p chain)', color='#B91C1C', fontsize=8.5)

    c2_out = patches.Circle((0, 0), 1.0, color='#FEF08A', ec='#CA8A04', lw=2)
    c2_in = patches.Circle((0, 0), 0.55, color='#FACC15', ec='#854D0E', lw=1.5)
    ax.add_patch(c2_out)
    ax.add_patch(c2_in)
    text_clean(ax, 0, -1.45, r'Sun-like Star ($0.35 - 1.3 M_\odot$)' + '\n' + r'Radiative Core + Convective Envelope' + '\n' + r'(p-p chain)', color='#854D0E', fontsize=8.5)

    c3_out = patches.Circle((3.0, 0), 1.0, color='#BAE6FD', ec='#0284C7', lw=2)
    c3_in = patches.Circle((3.0, 0), 0.55, color='#38BDF8', ec='#0369A1', lw=1.5)
    ax.add_patch(c3_out)
    ax.add_patch(c3_in)
    text_clean(ax, 3.0, -1.45, r'High-Mass Star ($M > 1.3 M_\odot$)' + '\n' + r'Convective Core + Radiative Envelope' + '\n' + r'(CNO Cycle)', color='#0369A1', fontsize=8.5)

    ax.set_xlim(-4.6, 4.6)
    ax.set_ylim(-2.2, 1.6)
    ax.set_title('Internal Energy Transport Structures by Stellar Mass', fontsize=11, fontweight='bold', pad=12)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'astro3_q25_q35_stellar_interiors.png'), dpi=150)
    plt.close()

def create_astro3_q38_luminosity_radius_temp():
    fig, ax = plt.subplots(figsize=(7.5, 4.5), dpi=150)
    ax.set_aspect('equal')
    ax.axis('off')

    cA = patches.Circle((-2.0, 0), 1.2, color='#60A5FA', ec='#1D4ED8', lw=2)
    ax.add_patch(cA)
    text_clean(ax, -2.0, 0, r'Star A' + '\n' + r'$L_A = 100 L_\odot$' + '\n' + r'$T_A = 10,000\text{ K}$', color='#1E3A8A', fontsize=9.5)

    cB = patches.Circle((2.5, 0), 0.35, color='#FCA5A5', ec='#B91C1C', lw=2)
    ax.add_patch(cB)
    text_clean(ax, 2.5, 0.7, r'Star B' + '\n' + r'$L_B = 0.01 L_\odot$' + '\n' + r'$T_B = 3,000\text{ K}$', color='#991B1B', fontsize=9)

    text_clean(ax, 0.2, -1.6, r'Stefan-Boltzmann Law: $L \propto R^2 T^4 \Rightarrow R \propto \frac{\sqrt{L}}{T^2}$' + '\n' + r'$\frac{R_A}{R_B} = \sqrt{\frac{L_A}{L_B}} \times \left(\frac{T_B}{T_A}\right)^2 = 100 \times 0.09 = 9$', color='#0F172A', fontsize=9.5, pad=0.35)

    ax.set_xlim(-3.8, 3.8)
    ax.set_ylim(-2.2, 1.6)
    ax.set_title('Stellar Radii Comparison via Stefan-Boltzmann Law', fontsize=11, fontweight='bold', pad=12)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'astro3_q38_luminosity_radius_temp.png'), dpi=150)
    plt.close()

def create_astro3_q50_stellar_fate():
    fig, ax = plt.subplots(figsize=(8.2, 4.6), dpi=150)
    ax.axis('off')

    text_clean(ax, -3.2, 1.2, r'Initial Mass' + '\n' + r'$M < 8 M_\odot$', color='#1E3A8A', fontsize=9.5)
    text_clean(ax, 0, 1.2, r'Initial Mass' + '\n' + r'$8 M_\odot \leq M \leq 25 M_\odot$', color='#065F46', fontsize=9.5)
    text_clean(ax, 3.2, 1.2, r'Initial Mass' + '\n' + r'$M > 25 M_\odot$', color='#7C3AED', fontsize=9.5)

    ax.annotate('', xy=(-3.2, -0.4), xytext=(-3.2, 0.7), arrowprops=dict(arrowstyle='->', lw=2, color='#2563EB'))
    ax.annotate('', xy=(0, -0.4), xytext=(0, 0.7), arrowprops=dict(arrowstyle='->', lw=2, color='#059669'))
    ax.annotate('', xy=(3.2, -0.4), xytext=(3.2, 0.7), arrowprops=dict(arrowstyle='->', lw=2, color='#8B5CF6'))

    text_clean(ax, -3.2, -0.8, r'Planetary Nebula' + '\n+\n' + r'White Dwarf ($M_{\text{core}} < 1.4 M_\odot$)', color='#1D4ED8', fontsize=9)
    text_clean(ax, 0, -0.8, r'Supernova (Type II)' + '\n+\n' + r'Neutron Star ($1.4 - 3 M_\odot$)', color='#047857', fontsize=9)
    text_clean(ax, 3.2, -0.8, r'Supernova / Hypernova' + '\n+\n' + r'Stellar Black Hole ($> 3 M_\odot$)', color='#6D28D9', fontsize=9)

    ax.set_xlim(-4.8, 4.8)
    ax.set_ylim(-1.6, 2.0)
    ax.set_title('Stellar End States & Remnants by Initial Mass', fontsize=11, fontweight='bold', pad=12)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'astro3_q50_stellar_fate.png'), dpi=150)
    plt.close()

# ==========================================
# DIAGRAMS FOR Physics M.6 Chapter 15 & 16
# ==========================================

def create_phy_m6_ch15_hydraulic():
    fig, ax = plt.subplots(figsize=(6.5, 4.2), dpi=150)
    ax.axis('off')
    
    # Outer U-Tube Wall Frame
    wall_x = [-2.8, -2.8, -1.8, -1.8, 0.8, 0.8, 2.5, 2.5]
    wall_y = [1.2, -1.2, -1.2, -1.2, -1.2, -1.2, -1.2, 1.2]
    
    # Hydraulic fluid polygon with proper connected U-pipe shape
    fluid_path = patches.Polygon([
        (-2.8, 0.0), (-2.8, -1.2), (2.5, -1.2), (2.5, 0.0),
        (0.8, 0.0), (0.8, -0.6), (-1.8, -0.6), (-1.8, 0.0)
    ], color='#60A5FA', alpha=0.75, zorder=1)
    ax.add_patch(fluid_path)
    
    # Pipe Outer Outlines
    ax.plot([-2.8, -2.8, 2.5, 2.5], [1.2, -1.2, -1.2, 1.2], 'k-', lw=2.2, zorder=3)
    ax.plot([-1.8, -1.8, 0.8, 0.8], [1.2, -0.6, -0.6, 1.2], 'k-', lw=2.2, zorder=3)
    
    # Pistons inside the tubes
    piston1 = patches.Rectangle((-2.8, 0.0), 1.0, 0.25, color='#475569', zorder=4)
    piston2 = patches.Rectangle((0.8, 0.0), 1.7, 0.30, color='#334155', zorder=4)
    ax.add_patch(piston1)
    ax.add_patch(piston2)
    
    # Force Arrows & Labels
    ax.annotate('', xy=(-2.3, 0.25), xytext=(-2.3, 1.4),
                arrowprops=dict(arrowstyle='->', lw=2.5, color='#DC2626'))
    add_label_box(ax, r'Input Force $F_1 = ?$', -2.3, 1.6, color='#DC2626', fontsize=9.5)
    add_label_box(ax, r'$A_1 = 0.02\text{ m}^2$', -2.3, -0.3, color='black', fontsize=9)
    
    ax.annotate('', xy=(1.65, 1.4), xytext=(1.65, 0.3),
                arrowprops=dict(arrowstyle='->', lw=2.5, color='#2563EB'))
    add_label_box(ax, r'Car Mass $M = 1,600\text{ kg}$', 1.65, 1.6, color='#1E40AF', fontsize=9.5)
    add_label_box(ax, r'$A_2 = 0.8\text{ m}^2$', 1.65, -0.3, color='black', fontsize=9)
    
    # Fluid Label
    add_label_box(ax, r'Hydraulic Oil ($\rho = 800\text{ kg/m}^3$)', 0, -0.9, color='#1E3A8A', fontsize=9.5)
    
    ax.set_xlim(-3.6, 3.6)
    ax.set_ylim(-1.6, 2.2)
    ax.set_title('Hydraulic Press System (Pascal\'s Law)', fontsize=12, fontweight='bold', pad=10)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'phy_m6_ch15_hydraulic.png'), dpi=150)
    plt.close()

def create_phy_m6_ch15_utube():
    fig, ax = plt.subplots(figsize=(6.0, 4.5), dpi=150)
    ax.axis('off')
    
    # Outer U-Tube Wall Frame (Continuous U-pipe)
    ax.plot([-1.6, -1.6, 1.6, 1.6], [2.2, -1.2, -1.2, 2.2], 'k-', lw=2.5, zorder=4)
    ax.plot([-0.6, -0.6, 0.6, 0.6], [2.2, -0.4, -0.4, 2.2], 'k-', lw=2.5, zorder=4)
    
    # Water filling (Bottom U and Right column up to y=0.8)
    water_polygon = patches.Polygon([
        (-1.6, -0.4), (-1.6, -1.2), (1.6, -1.2), (1.6, 0.8),
        (0.6, 0.8), (0.6, -0.4)
    ], color='#3B82F6', alpha=0.75, zorder=1)
    ax.add_patch(water_polygon)
    
    # Oil filling (Left column from y=-0.4 up to y=1.4)
    oil_polygon = patches.Polygon([
        (-1.6, -0.4), (-1.6, 1.4), (-0.6, 1.4), (-0.6, -0.4)
    ], color='#F59E0B', alpha=0.85, zorder=2)
    ax.add_patch(oil_polygon)
    
    # Interface Reference Level at y = -0.4
    ax.plot([-2.0, 2.0], [-0.4, -0.4], 'r--', lw=1.5, zorder=5)
    add_label_box(ax, 'Interface Reference Level', 0.0, -0.4, color='#DC2626', fontsize=8.5)
    
    # Height indicators
    ax.annotate('', xy=(-1.9, 1.4), xytext=(-1.9, -0.4), arrowprops=dict(arrowstyle='<->', lw=1.5, color='#B45309'))
    add_label_box(ax, r'$h_{\text{oil}} = 15\text{ cm}$', -2.7, 0.5, color='#B45309', fontsize=9)
    
    ax.annotate('', xy=(1.9, 0.8), xytext=(1.9, -0.4), arrowprops=dict(arrowstyle='<->', lw=1.5, color='#1D4ED8'))
    add_label_box(ax, r'$h_{\text{water}} = 12\text{ cm}$', 2.7, 0.2, color='#1D4ED8', fontsize=9)
    
    add_label_box(ax, r'Oil ($\rho_{\text{oil}} = ?$)', -1.1, 1.7, color='#92400E', fontsize=9.5)
    add_label_box(ax, r'Water ($\rho = 1000\text{ kg/m}^3$)', 1.1, 1.1, color='#1E40AF', fontsize=9)
    
    ax.set_xlim(-3.5, 3.5)
    ax.set_ylim(-1.6, 2.5)
    ax.set_title('U-Tube Manometer with Immiscible Liquids', fontsize=12, fontweight='bold', pad=10)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'phy_m6_ch15_utube.png'), dpi=150)
    plt.close()

def create_phy_m6_ch15_venturi():
    fig, ax = plt.subplots(figsize=(6.5, 3.8), dpi=150)
    ax.axis('off')
    
    # Pipe contour
    x = np.linspace(-3, 3, 200)
    y_top = 1.2 - 0.5 * np.exp(-x**2 / 0.8)
    y_bot = -1.2 + 0.5 * np.exp(-x**2 / 0.8)
    
    ax.plot(x, y_top, 'k-', lw=2.2)
    ax.plot(x, y_bot, 'k-', lw=2.2)
    
    # Streamlines
    ax.annotate('', xy=(-0.5, 0), xytext=(-2.5, 0), arrowprops=dict(arrowstyle='->', lw=2, color='#2563EB'))
    ax.annotate('', xy=(2.5, 0), xytext=(0.5, 0), arrowprops=dict(arrowstyle='->', lw=2.5, color='#DC2626'))
    
    add_label_box(ax, r'Inlet Flow Rate $Q = 0.04\text{ m}^3/\text{s}$' + '\n' + r'Oil Density $\rho = 800\text{ kg/m}^3$', -2.0, 1.6, color='#1E40AF', fontsize=8.5)
    add_label_box(ax, r'Exit Area $A_2 = 0.01\text{ m}^2$' + '\n' + r'Exit Velocity $v_2 = ?$', 0.0, -1.6, color='#991B1B', fontsize=9)
    add_label_box(ax, r'Wide Section $A_1$', -2.0, -0.6, color='#1E3A8A', fontsize=8.5)
    add_label_box(ax, r'Narrow Section $A_2$', 0.0, 0.5, color='#991B1B', fontsize=8.5)
    
    ax.set_xlim(-3.4, 3.4)
    ax.set_ylim(-2.2, 2.2)
    ax.set_title('Fluid Dynamics: Continuity in Pipe Flow', fontsize=12, fontweight='bold', pad=10)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'phy_m6_ch15_venturi.png'), dpi=150)
    plt.close()

def create_phy_m6_ch16_phase_change():
    fig, ax = plt.subplots(figsize=(6.5, 4.2), dpi=150)
    
    # Time vs Temperature
    t = [0, 2, 8, 14, 20]
    T = [-10, 0, 0, 100, 100]
    
    ax.plot(t, T, 'b-o', lw=2.5, markersize=6)
    
    ax.axhline(0, color='gray', linestyle='--', alpha=0.5)
    ax.axhline(100, color='gray', linestyle='--', alpha=0.5)
    
    # Show only process names and temperatures, NO equations (let students deduce formulas)
    add_label_box(ax, r'Ice (-10°C → 0°C)', 1.0, -5, color='#1D4ED8', fontsize=8.5)
    add_label_box(ax, r'Melting (0°C)', 5.0, 8, color='#047857', fontsize=8.5)
    add_label_box(ax, r'Water Heating (0°C → 100°C)', 11.0, 50, color='#B45309', fontsize=8.5)
    add_label_box(ax, r'Boiling / Vaporization (100°C)', 17.0, 108, color='#B91C1C', fontsize=8.5)
    
    ax.set_xlabel('Heat Added / Time', fontsize=11, fontweight='bold')
    ax.set_ylabel('Temperature (°C)', fontsize=11, fontweight='bold')
    ax.set_title('Heating Curve & Phase Change Stages', fontsize=12, fontweight='bold', pad=10)
    ax.set_xlim(-0.5, 21.5)
    ax.set_ylim(-20, 125)
    ax.grid(True, linestyle=':', alpha=0.6)
    
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'phy_m6_ch16_phase_change.png'), dpi=150)
    plt.close()

def create_phy_m6_ch16_solar_collector():
    fig, ax = plt.subplots(figsize=(6.5, 4.0), dpi=150)
    ax.axis('off')
    
    # Solar panel box
    panel = patches.Rectangle((-1.8, -0.6), 3.6, 1.2, angle=15, color='#1E293B', ec='#38BDF8', lw=2, zorder=2)
    ax.add_patch(panel)
    
    # Sunlight rays
    for dx in [-1.2, -0.4, 0.4, 1.2]:
        ax.annotate('', xy=(dx, 0.4), xytext=(dx + 0.3, 1.8),
                    arrowprops=dict(arrowstyle='->', lw=2, color='#F59E0B'))
        
    add_label_box(ax, r'Solar Intensity $800\text{ W/m}^2$' + '\n' + r'Panel Area $A = 4\text{ m}^2$', 0.5, 2.0, color='#B45309', fontsize=9.5)
    
    # Pipe in & out (Show input parameters, omit answer output temperature)
    add_label_box(ax, r'Inlet Water ($25^\circ\text{C}$)' + '\n' + r'Flow $1.6\text{ kg/min}$', -2.7, -0.8, color='#1D4ED8', fontsize=8.5)
    ax.annotate('', xy=(-1.5, -0.4), xytext=(-2.5, -0.8), arrowprops=dict(arrowstyle='->', lw=2, color='#2563EB'))
    
    add_label_box(ax, r'Outlet Water' + '\n' + r'$T_{\text{out}} = ?$', 2.7, 0.6, color='#DC2626', fontsize=9)
    ax.annotate('', xy=(2.5, 0.6), xytext=(1.5, 0.2), arrowprops=dict(arrowstyle='->', lw=2, color='#DC2626'))
    
    add_label_box(ax, r'System Efficiency $\eta = 70\%$', 0, -1.4, color='#047857', fontsize=9.5)
    
    ax.set_xlim(-3.5, 3.5)
    ax.set_ylim(-1.8, 2.4)
    ax.set_title('Solar Thermal Collector System Diagram', fontsize=12, fontweight='bold', pad=10)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'phy_m6_ch16_solar_collector.png'), dpi=150)
    plt.close()

# Generate Astro2 diagrams!
create_astro2_q5_circumpolar()
create_astro2_q7_third_quarter()
create_astro2_q9_opposition()
create_astro2_q12_eastern_elongation()
create_astro2_q16_conic_sections()
create_astro2_q23_parallax()
# create_astro2_q43_winter_triangle()  # Removed per user request
create_astro2_q46_orbit_change()

# Generate Astro3 diagrams!
create_astro3_q6_visibility()
create_astro3_q8_ellipse_velocities()
create_astro3_q11_redshift()
create_astro3_q23_prograde_burn()
create_astro3_q25_q35_stellar_interiors()
create_astro3_q38_luminosity_radius_temp()
create_astro3_q50_stellar_fate()

# Generate Physics M.6 Chapter 15 & 16 diagrams!
create_phy_m6_ch15_hydraulic()
create_phy_m6_ch15_utube()
create_phy_m6_ch15_venturi()
create_phy_m6_ch16_phase_change()
create_phy_m6_ch16_solar_collector()

print("ALL DIAGRAMS PERFECTLY GENERATED!")


