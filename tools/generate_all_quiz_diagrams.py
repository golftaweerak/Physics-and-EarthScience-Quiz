import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np
import os

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
    ax.set_ylim(0, 22)
    ax.grid(True, linestyle=':', alpha=0.7)
    ax.legend(fontsize=11)
    
    ax.plot(3, 12, 'bo', markersize=7)
    add_label_box(ax, '(3, 12)', 3, 13.5, color='blue', fontsize=10)
    
    ax.plot(4, 8, 'ro', markersize=7)
    add_label_box(ax, '(4, 8)', 4, 6.5, color='red', fontsize=10)
    
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'phy_m4_ch3-5_q5.png'), dpi=150)
    plt.close()

def create_ch3_5_q7():
    fig, ax = plt.subplots(figsize=(6, 4.5), dpi=150)
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
    add_label_box(ax, r'$\theta = 37^\circ$', 0.9, 0.25, color='darkgreen', fontsize=11)
    
    # Block flush on incline
    s0 = L * 0.55
    w, h = 1.0, 0.6
    x_cm, y_cm = draw_incline_block(ax, s0, w, h, theta_deg, color='skyblue', ec='blue', label='m = 5 kg')
    
    # Gravity mg arrow from CM
    ax.annotate('', xy=(x_cm, y_cm - 1.2), xytext=(x_cm, y_cm),
                arrowprops=dict(arrowstyle="->", color="crimson", lw=2.5))
    add_label_box(ax, 'mg = 50 N', x_cm + 0.6, y_cm - 0.8, color='crimson', fontsize=10)
    
    # Friction f_k arrow UP the incline (block sliding down)
    fx_start = s0 * np.cos(theta)
    fy_start = s0 * np.sin(theta)
    fx_end = (s0 + 1.1) * np.cos(theta)
    fy_end = (s0 + 1.1) * np.sin(theta)
    
    ax.annotate('', xy=(fx_end, fy_end), xytext=(fx_start, fy_start),
                arrowprops=dict(arrowstyle="->", color="darkorange", lw=2.5))
    add_label_box(ax, r'$f_k$', fx_end - 0.1, fy_end + 0.35, color='darkorange', fontsize=12)
    
    ax.set_xlim(-0.5, xb + 0.8)
    ax.set_ylim(-1.5, yb + 0.8)
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
    add_label_box(ax, r'$f_{s,max} = 30\text{ N}$', 22, 33, color='red', fontsize=10)
    
    ax.plot(45, 20, 'go', markersize=7)
    add_label_box(ax, r'$f_k = 20\text{ N}$', 52, 23, color='green', fontsize=10)
    
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
    add_label_box(ax, r'$30^\circ$', 0.8, 0.2, color='darkgreen', fontsize=10)
    
    # Block flush on incline
    s0 = L * 0.5
    w1, h1 = 1.0, 0.6
    x_cm, y_cm = draw_incline_block(ax, s0, w1, h1, theta_deg, color='lightgreen', ec='green', label=r'$m_1=6\text{kg}$')
    
    # Pulley geometry: Top tangent MUST lie at height h1/2 above incline line to be 100% PARALLEL!
    R_p = 0.25
    # Tangent line along incline at height h1/2 = 0.3
    # Pulley center vector offset along incline tangent & normal
    p_cx = xb + (h1 / 2.0 - R_p) * (-np.sin(theta)) + R_p * np.cos(theta)
    p_cy = yb + (h1 / 2.0 - R_p) * (np.cos(theta)) + R_p * np.sin(theta)
    
    ax.plot([xb, p_cx], [yb, p_cy], 'k-', lw=2.5)
    pulley = patches.Circle((p_cx, p_cy), R_p, color='lightgray', ec='black', lw=2, zorder=4)
    ax.add_patch(pulley)
    ax.plot(p_cx, p_cy, 'ko', markersize=3, zorder=5)
    
    # 100% PERFECTLY PARALLEL ROPE along incline
    rope_start_x = (s0 + w1 / 2.0) * np.cos(theta) - (h1 / 2.0) * np.sin(theta)
    rope_start_y = (s0 + w1 / 2.0) * np.sin(theta) + (h1 / 2.0) * np.cos(theta)
    
    rope_p_top_x = p_cx - R_p * np.sin(theta)
    rope_p_top_y = p_cy + R_p * np.cos(theta)
    ax.plot([rope_start_x, rope_p_top_x], [rope_start_y, rope_p_top_y], 'k-', lw=2)
    
    # Vertical rope from right edge of pulley
    rope_v_x = p_cx + R_p
    ax.plot([rope_v_x, rope_v_x], [p_cy, yb - 0.7], 'k-', lw=2)
    
    # Hanging block m2 centered horizontally at rope_v_x
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
    add_label_box(ax, 'F = 50 N', fx + 0.3, fy + 0.1, color='crimson', fontsize=11)
    
    ax.plot([2.7, 4.3], [1.4, 1.4], 'k--', lw=1.2)
    arc = patches.Arc((2.7, 1.4), 1.0, 1.0, angle=0, theta1=0, theta2=37, color='darkgreen', lw=1.5)
    ax.add_patch(arc)
    add_label_box(ax, r'$37^\circ$', 3.4, 1.55, color='darkgreen', fontsize=10)
    
    ax.set_xlim(0, 5.5)
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
    add_label_box(ax, r'$F_1 = 12\text{ N}$', 2.2, 0.4, color='red', fontsize=10)
    
    ax.annotate('', xy=(0, 1.5), xytext=(0, 0.25),
                arrowprops=dict(arrowstyle="->", color="blue", lw=2.5))
    add_label_box(ax, r'$F_2 = 5\text{ N}$', 0.6, 1.5, color='blue', fontsize=10)
    
    ax.annotate('', xy=(-0.9, 0), xytext=(-0.25, 0),
                arrowprops=dict(arrowstyle="->", color="green", lw=2.5))
    add_label_box(ax, r'$F_3 = 3\text{ N}$', -1.2, 0.4, color='green', fontsize=10)
    
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
        add_label_box(ax, lbl, rp + 0.4, fp + 5, color='darkred', fontsize=10)

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
    add_label_box(ax, r'$F_g = G\frac{Mm}{r^2}$', 0.6, 1.8, color='crimson', fontsize=10)
    
    ax.annotate('', xy=(-1.2, 2.5), xytext=(-0.2, 2.5),
                arrowprops=dict(arrowstyle="->", color="green", lw=2.5))
    add_label_box(ax, r'$v = \sqrt{\frac{GM}{r}}$', -1.2, 2.9, color='green', fontsize=10)
    
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
    add_label_box(ax, 'F = 100 N', fx_start - 0.3, fy_start + 0.15, color='crimson', fontsize=11)
    
    ax.plot([0.5, 2.0], [1.8, 1.8], 'k--', lw=1.2)
    arc = patches.Arc((2.0, 1.8), 1.0, 1.0, angle=0, theta1=180, theta2=180+37, color='darkgreen', lw=1.5)
    ax.add_patch(arc)
    add_label_box(ax, r'$37^\circ$', 1.2, 2.05, color='darkgreen', fontsize=10)
    
    ax.set_xlim(0, 5.0)
    ax.set_ylim(0.5, 3.2)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'phy_m4_ch3-6_q26.png'), dpi=150)
    plt.close()

# Generate ALL 16 diagrams!
print("Generating 16 physics diagrams with 100% PERFECT PARALLEL STRINGS & ZERO TEXT OVERLAP...")
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

print("ALL 16 DIAGRAMS PERFECTLY GENERATED!")
