import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np
import os

# Create directory if it doesn't exist
output_dir = 'public/assets/images'
os.makedirs(output_dir, exist_ok=True)

plt.rcParams['font.family'] = 'DejaVu Sans'
plt.rcParams['font.size'] = 11

def create_q5_graph():
    # Graph of F vs a for two masses
    fig, ax = plt.subplots(figsize=(6, 4), dpi=150)
    a = np.linspace(0, 5, 100)
    F_A = 4 * a
    F_B = 2 * a
    
    ax.plot(a, F_A, 'b-', linewidth=2.5, label='Object A')
    ax.plot(a, F_B, 'r--', linewidth=2.5, label='Object B')
    
    ax.set_xlabel('Acceleration a (m/s²)', fontsize=12, fontweight='bold')
    ax.set_ylabel('Force F (N)', fontsize=12, fontweight='bold')
    ax.set_title('Force vs Acceleration Graph', fontsize=13, fontweight='bold', pad=12)
    ax.set_xlim(0, 5)
    ax.set_ylim(0, 22)
    ax.grid(True, linestyle=':', alpha=0.7)
    ax.legend(fontsize=11)
    
    # Mark points
    ax.plot(3, 12, 'bo', markersize=7)
    ax.annotate('(3, 12)', (3, 12), textcoords="offset points", xytext=(-20,10), ha='center', fontsize=10, color='blue', fontweight='bold')
    
    ax.plot(4, 8, 'ro', markersize=7)
    ax.annotate('(4, 8)', (4, 8), textcoords="offset points", xytext=(15,-15), ha='center', fontsize=10, color='red', fontweight='bold')
    
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'phy_m4_ch3-5_q5.png'), dpi=150)
    plt.close()

def create_q7_incline():
    fig, ax = plt.subplots(figsize=(6, 4.5), dpi=150)
    ax.set_aspect('equal')
    ax.axis('off')
    
    # Incline triangle
    theta = 37 # degrees
    theta_rad = np.radians(theta)
    L = 5
    x_base = L * np.cos(theta_rad)
    y_base = L * np.sin(theta_rad)
    
    # Draw incline
    ax.plot([0, x_base, x_base, 0], [0, 0, y_base, 0], 'k-', linewidth=2)
    
    # Angle arc
    arc = patches.Arc((0, 0), 1.5, 1.5, angle=0, theta1=0, theta2=theta, color='darkgreen', linewidth=1.5)
    ax.add_patch(arc)
    ax.text(0.9, 0.25, r'$\theta = 37^\circ$', fontsize=11, color='darkgreen', fontweight='bold')
    
    # Block on incline
    bx = x_base * 0.5
    by = y_base * 0.5
    block = patches.Rectangle((bx-0.4, by), 0.8, 0.6, angle=theta, color='skyblue', ec='blue', lw=2)
    ax.add_patch(block)
    ax.text(bx - 0.1, by + 0.35, 'm = 5 kg', fontsize=11, fontweight='bold', rotation=theta)
    
    # Gravity force arrow
    ax.annotate('', xy=(bx, by - 1.2), xytext=(bx, by + 0.2),
                arrowprops=dict(arrowstyle="->", color="red", lw=2))
    ax.text(bx + 0.15, by - 0.9, 'mg = 50 N', color='red', fontweight='bold', fontsize=10)
    
    # Friction arrow
    fx = bx - 0.8 * np.cos(theta_rad)
    fy = by - 0.8 * np.sin(theta_rad)
    ax.annotate('', xy=(fx, fy), xytext=(bx, by),
                arrowprops=dict(arrowstyle="->", color="orange", lw=2))
    ax.text(fx - 0.2, fy + 0.3, r'$f_k$', color='orange', fontweight='bold', fontsize=11)
    
    ax.set_xlim(-0.5, x_base + 0.5)
    ax.set_ylim(-1.5, y_base + 0.8)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'phy_m4_ch3-5_q7.png'), dpi=150)
    plt.close()

def create_q14_friction_graph():
    fig, ax = plt.subplots(figsize=(6, 4), dpi=150)
    
    # F vs f graph
    F_static = np.linspace(0, 30, 100)
    f_static = F_static
    
    F_kinetic = np.linspace(30, 60, 100)
    f_kinetic = np.full_like(F_kinetic, 20)
    
    ax.plot(F_static, f_static, 'b-', linewidth=2.5, label='Static Region')
    ax.plot([30, 30], [30, 20], 'r--', linewidth=1.5)
    ax.plot(F_kinetic, f_kinetic, 'g-', linewidth=2.5, label='Kinetic Region')
    
    ax.plot(30, 30, 'ro', markersize=7)
    ax.annotate(r'$f_{s,max} = 30\text{ N}$', (30, 30), textcoords="offset points", xytext=(-35, 10),
                fontsize=10, color='red', fontweight='bold')
    
    ax.plot(40, 20, 'go', markersize=7)
    ax.annotate(r'$f_k = 20\text{ N}$', (40, 20), textcoords="offset points", xytext=(10, 10),
                fontsize=10, color='green', fontweight='bold')
    
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

def create_q18_atwood():
    fig, ax = plt.subplots(figsize=(4, 5), dpi=150)
    ax.set_aspect('equal')
    ax.axis('off')
    
    # Ceiling
    ax.plot([0.5, 3.5], [4.5, 4.5], 'k-', lw=3)
    for i in np.linspace(0.6, 3.4, 10):
        ax.plot([i, i+0.2], [4.5, 4.7], 'k-', lw=1)
        
    # Pulley holder & Pulley
    ax.plot([2, 2], [4.5, 3.8], 'k-', lw=2)
    pulley = patches.Circle((2, 3.5), 0.3, color='gray', ec='black', lw=2)
    ax.add_patch(pulley)
    ax.plot(2, 3.5, 'ko', markersize=4)
    
    # Ropes & Masses
    # Left rope & Mass 1
    ax.plot([1.7, 1.7], [3.5, 2.0], 'k-', lw=2)
    m1 = patches.Rectangle((1.4, 1.4), 0.6, 0.6, color='lightgreen', ec='darkgreen', lw=2)
    ax.add_patch(m1)
    ax.text(1.7, 1.7, r'$m_1=3\text{kg}$', ha='center', va='center', fontweight='bold', fontsize=10)
    
    # Right rope & Mass 2
    ax.plot([2.3, 2.3], [3.5, 1.2], 'k-', lw=2)
    m2 = patches.Rectangle((1.95, 0.4), 0.7, 0.8, color='coral', ec='firebrick', lw=2)
    ax.add_patch(m2)
    ax.text(2.3, 0.8, r'$m_2=5\text{kg}$', ha='center', va='center', fontweight='bold', fontsize=10)
    
    ax.set_xlim(0, 4)
    ax.set_ylim(0, 5)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'phy_m4_ch3-5_q18.png'), dpi=150)
    plt.close()

def create_q19_table_pulley():
    fig, ax = plt.subplots(figsize=(5.5, 3.5), dpi=150)
    ax.set_aspect('equal')
    ax.axis('off')
    
    # Table surface
    ax.plot([0, 4, 4], [2, 2, 0], 'k-', lw=2.5)
    
    # Block 1 on table
    b1 = patches.Rectangle((1.2, 2.0), 1.0, 0.6, color='skyblue', ec='blue', lw=2)
    ax.add_patch(b1)
    ax.text(1.7, 2.3, r'$m_1=4\text{kg}$', ha='center', va='center', fontweight='bold', fontsize=10)
    
    # Pulley at edge
    pulley = patches.Circle((4.0, 2.0), 0.2, color='gray', ec='black', lw=2)
    ax.add_patch(pulley)
    
    # String
    ax.plot([2.2, 4.0], [2.2, 2.2], 'k-', lw=2)
    ax.plot([4.2, 4.2], [2.0, 0.8], 'k-', lw=2)
    
    # Hanging block 2
    b2 = patches.Rectangle((3.9, 0.2), 0.6, 0.6, color='sandybrown', ec='chocolate', lw=2)
    ax.add_patch(b2)
    ax.text(4.2, 0.5, r'$m_2=6\text{kg}$', ha='center', va='center', fontweight='bold', fontsize=10)
    
    ax.set_xlim(-0.2, 5.0)
    ax.set_ylim(-0.2, 3.2)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'phy_m4_ch3-5_q19.png'), dpi=150)
    plt.close()

def create_q21_incline_pulley():
    fig, ax = plt.subplots(figsize=(6, 4), dpi=150)
    ax.set_aspect('equal')
    ax.axis('off')
    
    # Incline
    theta = 30
    theta_rad = np.radians(theta)
    L = 4.5
    xb = L * np.cos(theta_rad)
    yb = L * np.sin(theta_rad)
    
    ax.plot([0, xb, xb, 0], [0, 0, yb, 0], 'k-', lw=2)
    arc = patches.Arc((0,0), 1.2, 1.2, angle=0, theta1=0, theta2=30, color='darkgreen', lw=1.5)
    ax.add_patch(arc)
    ax.text(0.8, 0.2, r'$30^\circ$', fontsize=10, fontweight='bold', color='darkgreen')
    
    # Block on incline
    bx = xb * 0.5
    by = yb * 0.5
    b1 = patches.Rectangle((bx-0.4, by), 0.8, 0.5, angle=theta, color='lightgreen', ec='green', lw=2)
    ax.add_patch(b1)
    ax.text(bx-0.1, by+0.3, r'$m_1=6\text{kg}$', fontsize=9, fontweight='bold', rotation=theta)
    
    # Pulley at apex
    pulley = patches.Circle((xb, yb), 0.2, color='gray', ec='black', lw=2)
    ax.add_patch(pulley)
    
    # Rope
    rx = bx + 0.4 * np.cos(theta_rad) - 0.25 * np.sin(theta_rad)
    ry = by + 0.4 * np.sin(theta_rad) + 0.25 * np.cos(theta_rad)
    ax.plot([rx, xb], [ry, yb + 0.2], 'k-', lw=1.8)
    ax.plot([xb + 0.2, xb + 0.2], [yb, yb - 1.2], 'k-', lw=1.8)
    
    # Hanging block
    b2 = patches.Rectangle((xb - 0.1, yb - 1.7), 0.6, 0.5, color='gold', ec='darkgoldenrod', lw=2)
    ax.add_patch(b2)
    ax.text(xb + 0.2, yb - 1.45, r'$m_2=4\text{kg}$', fontsize=9, fontweight='bold', ha='center')
    
    ax.set_xlim(-0.3, xb + 1.0)
    ax.set_ylim(-0.3, yb + 0.8)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'phy_m4_ch3-5_q21.png'), dpi=150)
    plt.close()

def create_q23_angled_force():
    fig, ax = plt.subplots(figsize=(5.5, 3.5), dpi=150)
    ax.set_aspect('equal')
    ax.axis('off')
    
    # Floor
    ax.plot([0, 5], [1, 1], 'k-', lw=2.5)
    for i in np.linspace(0.1, 4.9, 15):
        ax.plot([i, i-0.15], [1, 0.8], 'k-', lw=1)
        
    # Block
    b = patches.Rectangle((1.5, 1.0), 1.2, 0.8, color='plum', ec='purple', lw=2)
    ax.add_patch(b)
    ax.text(2.1, 1.4, 'm = 10 kg', ha='center', va='center', fontweight='bold', fontsize=10)
    
    # Force Arrow at angle
    theta = 37
    theta_rad = np.radians(theta)
    fx = 2.7 + 1.6 * np.cos(theta_rad)
    fy = 1.4 + 1.6 * np.sin(theta_rad)
    
    ax.annotate('', xy=(fx, fy), xytext=(2.7, 1.4),
                arrowprops=dict(arrowstyle="->", color="crimson", lw=2.5))
    ax.text(fx + 0.1, fy + 0.1, 'F = 50 N', color='crimson', fontweight='bold', fontsize=11)
    
    # Dashed horizontal & angle
    ax.plot([2.7, 4.3], [1.4, 1.4], 'k--', lw=1.2)
    arc = patches.Arc((2.7, 1.4), 1.0, 1.0, angle=0, theta1=0, theta2=37, color='darkgreen', lw=1.5)
    ax.add_patch(arc)
    ax.text(3.4, 1.55, r'$37^\circ$', fontsize=10, color='darkgreen', fontweight='bold')
    
    ax.set_xlim(0, 5.5)
    ax.set_ylim(0.5, 3.2)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'phy_m4_ch3-5_q23.png'), dpi=150)
    plt.close()

def create_q29_vectors():
    fig, ax = plt.subplots(figsize=(4.5, 4.5), dpi=150)
    ax.set_aspect('equal')
    
    # Axes
    ax.axhline(0, color='gray', lw=1, ls='--')
    ax.axvline(0, color='gray', lw=1, ls='--')
    
    # Central object
    circle = patches.Circle((0,0), 0.2, color='lightblue', ec='navy', lw=2)
    ax.add_patch(circle)
    ax.text(0, 0, 'm=2kg', ha='center', va='center', fontsize=8, fontweight='bold')
    
    # Force F1: +x direction (12 N)
    ax.annotate('', xy=(2.4, 0), xytext=(0.2, 0),
                arrowprops=dict(arrowstyle="->", color="red", lw=2))
    ax.text(2.5, 0.1, r'$F_1 = 12\text{ N}$', color='red', fontweight='bold', fontsize=10)
    
    # Force F2: +y direction (5 N)
    ax.annotate('', xy=(0, 1.5), xytext=(0, 0.2),
                arrowprops=dict(arrowstyle="->", color="blue", lw=2))
    ax.text(0.1, 1.6, r'$F_2 = 5\text{ N}$', color='blue', fontweight='bold', fontsize=10)
    
    # Force F3: -x direction (3 N)
    ax.annotate('', xy=(-0.9, 0), xytext=(-0.2, 0),
                arrowprops=dict(arrowstyle="->", color="green", lw=2))
    ax.text(-1.8, 0.1, r'$F_3 = 3\text{ N}$', color='green', fontweight='bold', fontsize=10)
    
    ax.set_xlim(-2.2, 3.2)
    ax.set_ylim(-1.0, 2.2)
    ax.grid(True, linestyle=':', alpha=0.5)
    ax.set_title('Forces Acting on Mass m', fontsize=12, fontweight='bold')
    
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'phy_m4_ch3-5_q29.png'), dpi=150)
    plt.close()

# Run all generator functions
create_q5_graph()
create_q7_incline()
create_q14_friction_graph()
create_q18_atwood()
create_q19_table_pulley()
create_q21_incline_pulley()
create_q23_angled_force()
create_q29_vectors()

print("Successfully generated all 8 quiz diagrams!")
