import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np
import os

# Create directory if it doesn't exist
output_dir = 'public/assets/images'
os.makedirs(output_dir, exist_ok=True)

plt.rcParams['font.family'] = 'DejaVu Sans'
plt.rcParams['font.size'] = 11

def create_q2_grav_graph():
    # Graph of F_g vs r (Inverse square law)
    fig, ax = plt.subplots(figsize=(6, 4), dpi=150)
    r = np.linspace(1, 5, 200)
    F = 100 / (r**2)
    
    ax.plot(r, F, 'b-', linewidth=2.5, label=r'$F_g \propto \frac{1}{r^2}$')
    
    # Key points
    r_points = [1, 2, 4]
    F_points = [100, 25, 6.25]
    labels = [r'$(R, F_0)$', r'$(2R, \frac{F_0}{4})$', r'$(4R, \frac{F_0}{16})$']
    
    for rp, fp, lbl in zip(r_points, F_points, labels):
        ax.plot(rp, fp, 'ro', markersize=6)
        ax.plot([rp, rp], [0, fp], 'k:', alpha=0.5)
        ax.plot([0, rp], [fp, fp], 'k:', alpha=0.5)
        ax.annotate(lbl, (rp, fp), textcoords="offset points", xytext=(15, 8), ha='left', fontsize=10, color='darkred', fontweight='bold')

    ax.set_xlabel('Distance r (in terms of R)', fontsize=12, fontweight='bold')
    ax.set_ylabel('Gravitational Force F_g', fontsize=12, fontweight='bold')
    ax.set_title('Gravitational Force vs Distance Graph', fontsize=13, fontweight='bold', pad=12)
    ax.set_xlim(0, 5.2)
    ax.set_ylim(0, 110)
    ax.grid(True, linestyle=':', alpha=0.7)
    ax.legend(fontsize=11)
    
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'phy_m4_ch3-6_q2.png'), dpi=150)
    plt.close()

def create_q6_orbit():
    fig, ax = plt.subplots(figsize=(4.5, 4.5), dpi=150)
    ax.set_aspect('equal')
    ax.axis('off')
    
    # Earth
    earth = patches.Circle((0, 0), 1.2, color='deepskyblue', ec='navy', lw=2)
    ax.add_patch(earth)
    ax.text(0, 0, 'Earth\n(M)', color='white', ha='center', va='center', fontweight='bold', fontsize=10)
    
    # Orbit circle
    orbit = patches.Circle((0, 0), 2.5, fill=False, color='gray', ls='--', lw=1.5)
    ax.add_patch(orbit)
    
    # Satellite at top
    sat_x, sat_y = 0, 2.5
    sat = patches.Rectangle((-0.2, 2.35), 0.4, 0.3, color='orange', ec='darkred', lw=1.5)
    ax.add_patch(sat)
    ax.text(0, 2.8, 'Satellite (m)', ha='center', fontweight='bold', fontsize=10, color='darkred')
    
    # Forces and Velocity vectors
    # F_g vector pointing to center
    ax.annotate('', xy=(0, 1.3), xytext=(0, 2.35),
                arrowprops=dict(arrowstyle="->", color="crimson", lw=2.5))
    ax.text(0.15, 1.8, r'$F_g = G\frac{Mm}{r^2}$', color='crimson', fontweight='bold', fontsize=10)
    
    # v vector tangential to orbit (left)
    ax.annotate('', xy=(-1.2, 2.5), xytext=(-0.2, 2.5),
                arrowprops=dict(arrowstyle="->", color="green", lw=2.5))
    ax.text(-1.4, 2.65, r'$v = \sqrt{\frac{GM}{r}}$', color='green', fontweight='bold', fontsize=10)
    
    # Radius line
    ax.plot([0, 1.77], [0, 1.77], 'k:', lw=1.2)
    ax.text(0.9, 0.7, 'r', fontsize=11, fontweight='bold')
    
    ax.set_xlim(-3.0, 3.0)
    ax.set_ylim(-3.0, 3.2)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'phy_m4_ch3-6_q6.png'), dpi=150)
    plt.close()

def create_q10_earth_moon():
    fig, ax = plt.subplots(figsize=(6, 3), dpi=150)
    ax.set_aspect('equal')
    ax.axis('off')
    
    # Earth (Left)
    earth = patches.Circle((0, 0), 0.8, color='dodgerblue', ec='navy', lw=2)
    ax.add_patch(earth)
    ax.text(0, 0, r'$M_E$', color='white', ha='center', va='center', fontweight='bold', fontsize=11)
    
    # Moon (Right)
    moon = patches.Circle((5, 0), 0.4, color='lightgray', ec='dimgray', lw=2)
    ax.add_patch(moon)
    ax.text(5, 0, r'$M_M$', color='black', ha='center', va='center', fontweight='bold', fontsize=9)
    
    # Line connecting centers
    ax.plot([0, 5], [0, 0], 'k--', lw=1)
    
    # Zero g point P
    Px = 4.0 # closer to moon since M_E >> M_M
    ax.plot(Px, 0, 'rx', markersize=10, markeredgewidth=2.5)
    ax.text(Px, 0.35, 'Point P\n(g_net = 0)', color='red', ha='center', fontweight='bold', fontsize=9)
    
    # Force vectors at P
    ax.annotate('', xy=(Px - 0.8, 0), xytext=(Px, 0),
                arrowprops=dict(arrowstyle="->", color="blue", lw=2))
    ax.text(Px - 0.5, -0.4, r'$g_E$', color='blue', fontweight='bold', fontsize=10)
    
    ax.annotate('', xy=(Px + 0.8, 0), xytext=(Px, 0),
                arrowprops=dict(arrowstyle="->", color="purple", lw=2))
    ax.text(Px + 0.3, -0.4, r'$g_M$', color='purple', fontweight='bold', fontsize=10)
    
    ax.set_xlim(-1.2, 6.0)
    ax.set_ylim(-1.0, 1.2)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'phy_m4_ch3-6_q10.png'), dpi=150)
    plt.close()

def create_q13_vt_graph():
    fig, ax = plt.subplots(figsize=(6, 3.8), dpi=150)
    
    t1 = np.linspace(0, 4, 50)
    v1 = 3 * t1
    
    t2 = np.linspace(4, 10, 50)
    v2 = 12 + 1 * (t2 - 4)
    
    ax.plot(t1, v1, 'b-', lw=2.5, label='Phase 1 (0-4 s)')
    ax.plot(t2, v2, 'r-', lw=2.5, label='Phase 2 (4-10 s)')
    
    ax.plot(4, 12, 'ko', markersize=6)
    ax.annotate('(4, 12)', (4, 12), textcoords="offset points", xytext=(-25, 10), fontweight='bold')
    
    ax.plot(10, 18, 'ko', markersize=6)
    ax.annotate('(10, 18)', (10, 18), textcoords="offset points", xytext=(-25, 10), fontweight='bold')
    
    ax.set_xlabel('Time t (s)', fontsize=12, fontweight='bold')
    ax.set_ylabel('Velocity v (m/s)', fontsize=12, fontweight='bold')
    ax.set_title('Velocity vs Time Graph for Mass m = 4 kg', fontsize=12, fontweight='bold', pad=12)
    ax.set_xlim(0, 11)
    ax.set_ylim(0, 20)
    ax.grid(True, linestyle=':', alpha=0.7)
    ax.legend(fontsize=10)
    
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'phy_m4_ch3-6_q13.png'), dpi=150)
    plt.close()

def create_q15_incline_pulley():
    fig, ax = plt.subplots(figsize=(6, 4), dpi=150)
    ax.set_aspect('equal')
    ax.axis('off')
    
    theta = 37
    theta_rad = np.radians(theta)
    L = 4.5
    xb = L * np.cos(theta_rad)
    yb = L * np.sin(theta_rad)
    
    ax.plot([0, xb, xb, 0], [0, 0, yb, 0], 'k-', lw=2)
    arc = patches.Arc((0,0), 1.2, 1.2, angle=0, theta1=0, theta2=37, color='darkgreen', lw=1.5)
    ax.add_patch(arc)
    ax.text(0.8, 0.25, r'$37^\circ$', fontsize=10, fontweight='bold', color='darkgreen')
    
    # Block on incline
    bx = xb * 0.5
    by = yb * 0.5
    b1 = patches.Rectangle((bx-0.4, by), 0.8, 0.5, angle=theta, color='plum', ec='purple', lw=2)
    ax.add_patch(b1)
    ax.text(bx-0.1, by+0.3, r'$m_1=4\text{kg}$', fontsize=9, fontweight='bold', rotation=theta)
    
    # Pulley at apex
    pulley = patches.Circle((xb, yb), 0.2, color='gray', ec='black', lw=2)
    ax.add_patch(pulley)
    
    # Rope
    rx = bx + 0.4 * np.cos(theta_rad) - 0.25 * np.sin(theta_rad)
    ry = by + 0.4 * np.sin(theta_rad) + 0.25 * np.cos(theta_rad)
    ax.plot([rx, xb], [ry, yb + 0.2], 'k-', lw=1.8)
    ax.plot([xb + 0.2, xb + 0.2], [yb, yb - 1.2], 'k-', lw=1.8)
    
    # Hanging block
    b2 = patches.Rectangle((xb - 0.1, yb - 1.7), 0.6, 0.5, color='sandybrown', ec='saddlebrown', lw=2)
    ax.add_patch(b2)
    ax.text(xb + 0.2, yb - 1.45, r'$m_2=5\text{kg}$', fontsize=9, fontweight='bold', ha='center')
    
    ax.set_xlim(-0.3, xb + 1.0)
    ax.set_ylim(-0.3, yb + 0.8)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'phy_m4_ch3-6_q15.png'), dpi=150)
    plt.close()

def create_q18_stacked_blocks():
    fig, ax = plt.subplots(figsize=(5.5, 3), dpi=150)
    ax.set_aspect('equal')
    ax.axis('off')
    
    # Floor
    ax.plot([0, 5], [0.8, 0.8], 'k-', lw=2.5)
    for i in np.linspace(0.1, 4.9, 15):
        ax.plot([i, i-0.15], [0.8, 0.6], 'k-', lw=1)
        
    # Block 2 (bottom)
    b2 = patches.Rectangle((1.5, 0.8), 1.6, 0.7, color='lightblue', ec='navy', lw=2)
    ax.add_patch(b2)
    ax.text(2.3, 1.15, r'$m_2 = 6\text{ kg}$', ha='center', va='center', fontweight='bold', fontsize=10)
    
    # Block 1 (top)
    b1 = patches.Rectangle((1.8, 1.5), 1.0, 0.6, color='lightcoral', ec='firebrick', lw=2)
    ax.add_patch(b1)
    ax.text(2.3, 1.8, r'$m_1 = 2\text{ kg}$', ha='center', va='center', fontweight='bold', fontsize=10)
    
    # Force F pulling bottom block
    ax.annotate('', xy=(4.2, 1.15), xytext=(3.1, 1.15),
                arrowprops=dict(arrowstyle="->", color="crimson", lw=2.5))
    ax.text(4.3, 1.15, 'F', color='crimson', fontweight='bold', fontsize=12, va='center')
    
    ax.set_xlim(0, 5.2)
    ax.set_ylim(0.4, 2.5)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'phy_m4_ch3-6_q18.png'), dpi=150)
    plt.close()

def create_q22_3mass_pulley():
    fig, ax = plt.subplots(figsize=(6, 3.5), dpi=150)
    ax.set_aspect('equal')
    ax.axis('off')
    
    # Table surface
    ax.plot([1.0, 4.0], [2.0, 2.0], 'k-', lw=2.5)
    ax.plot([1.0, 1.0], [2.0, 0.5], 'k-', lw=2)
    ax.plot([4.0, 4.0], [2.0, 0.5], 'k-', lw=2)
    
    # Center block m2
    b2 = patches.Rectangle((2.0, 2.0), 1.0, 0.6, color='lightgreen', ec='darkgreen', lw=2)
    ax.add_patch(b2)
    ax.text(2.5, 2.3, r'$m_2=5\text{kg}$', ha='center', va='center', fontweight='bold', fontsize=9)
    
    # Left pulley & m1
    p_left = patches.Circle((1.0, 2.0), 0.2, color='gray', ec='black', lw=1.5)
    ax.add_patch(p_left)
    ax.plot([1.0, 2.0], [2.2, 2.2], 'k-', lw=1.8)
    ax.plot([0.8, 0.8], [2.0, 0.8], 'k-', lw=1.8)
    b1 = patches.Rectangle((0.5, 0.2), 0.6, 0.6, color='coral', ec='firebrick', lw=2)
    ax.add_patch(b1)
    ax.text(0.8, 0.5, r'$m_1=2\text{kg}$', ha='center', va='center', fontweight='bold', fontsize=8)
    
    # Right pulley & m3
    p_right = patches.Circle((4.0, 2.0), 0.2, color='gray', ec='black', lw=1.5)
    ax.add_patch(p_right)
    ax.plot([3.0, 4.0], [2.2, 2.2], 'k-', lw=1.8)
    ax.plot([4.2, 4.2], [2.0, 0.6], 'k-', lw=1.8)
    b3 = patches.Rectangle((3.9, 0.0), 0.6, 0.6, color='gold', ec='darkgoldenrod', lw=2)
    ax.add_patch(b3)
    ax.text(4.2, 0.3, r'$m_3=8\text{kg}$', ha='center', va='center', fontweight='bold', fontsize=8)
    
    ax.set_xlim(0, 5.0)
    ax.set_ylim(-0.3, 2.8)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'phy_m4_ch3-6_q22.png'), dpi=150)
    plt.close()

def create_q26_angled_push():
    fig, ax = plt.subplots(figsize=(5.5, 3.5), dpi=150)
    ax.set_aspect('equal')
    ax.axis('off')
    
    # Floor
    ax.plot([0, 5], [1, 1], 'k-', lw=2.5)
    for i in np.linspace(0.1, 4.9, 15):
        ax.plot([i, i-0.15], [1, 0.8], 'k-', lw=1)
        
    # Block
    b = patches.Rectangle((2.0, 1.0), 1.2, 0.8, color='thistle', ec='purple', lw=2)
    ax.add_patch(b)
    ax.text(2.6, 1.4, 'm = 8 kg', ha='center', va='center', fontweight='bold', fontsize=10)
    
    # Pushing Force Arrow at angle 37 deg down into the block
    theta = 37
    theta_rad = np.radians(theta)
    fx_start = 2.0 - 1.5 * np.cos(theta_rad)
    fy_start = 1.8 + 1.5 * np.sin(theta_rad)
    
    ax.annotate('', xy=(2.0, 1.8), xytext=(fx_start, fy_start),
                arrowprops=dict(arrowstyle="->", color="crimson", lw=2.5))
    ax.text(fx_start - 0.2, fy_start + 0.1, 'F = 100 N', color='crimson', fontweight='bold', fontsize=11)
    
    # Dashed horizontal line & angle arc
    ax.plot([0.5, 2.0], [1.8, 1.8], 'k--', lw=1.2)
    arc = patches.Arc((2.0, 1.8), 1.0, 1.0, angle=0, theta1=180, theta2=180+37, color='darkgreen', lw=1.5)
    ax.add_patch(arc)
    ax.text(1.2, 1.9, r'$37^\circ$', fontsize=10, color='darkgreen', fontweight='bold')
    
    ax.set_xlim(0, 5.0)
    ax.set_ylim(0.5, 3.2)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'phy_m4_ch3-6_q26.png'), dpi=150)
    plt.close()

# Execute all generators
create_q2_grav_graph()
create_q6_orbit()
create_q10_earth_moon()
create_q13_vt_graph()
create_q15_incline_pulley()
create_q18_stacked_blocks()
create_q22_3mass_pulley()
create_q26_angled_push()

print("Successfully generated all 8 diagrams for phy_m4_ch3-6!")
