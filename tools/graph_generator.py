import matplotlib.pyplot as plt
import numpy as np
import os

def create_directory_if_not_exists(path):
    """Creates a directory if it does not already exist."""
    if not os.path.exists(path):
        os.makedirs(path)

def plot_phy_m4_ch6_5_q16():
    """
    Generates the graph for phy_m4_ch6-5, question 16.
    Description: Graph of Force vs. Time. 
    It forms a triangle with base 0-6s and max height 30N at 6s.
    Points: (0,0) -> (6,30).
    """
    fig, ax = plt.subplots(figsize=(6, 4))
    
    # Data points
    x = [0, 6]
    y = [0, 30]
    
    # Plot the line
    ax.plot(x, y, 'b-', linewidth=2, label='Force')
    
    # Fill the area under the curve (Triangle)
    ax.fill_between(x, 0, y, color='skyblue', alpha=0.5)
    
    # Dashed line for reading the graph at (6, 30)
    ax.plot([6, 6], [0, 30], 'k--', alpha=0.5)
    ax.plot([0, 6], [30, 30], 'k--', alpha=0.5)

    # Labels and Title
    ax.set_title("Force vs. Time")
    ax.set_xlabel("Time (t) [s]")
    ax.set_ylabel("Force (F) [N]")
    
    # Grid and Limits
    ax.grid(True, linestyle='--', alpha=0.7)
    ax.set_xlim(0, 8)
    ax.set_ylim(0, 35)
    
    # Annotate specific points if necessary
    ax.text(6.1, 30, '(6, 30)', fontsize=10, verticalalignment='center')

    # Save the figure
    # Ensure directory exists relative to script location or CWD
    # The script is in tools/, we want to save to assets/images/ which is in root
    # If CWD is root, then 'assets/images' is correct.
    output_path = os.path.join('assets', 'images', 'phy_m4_ch6-5_q16.png')
    
    # Ensure the directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    plt.tight_layout()
    plt.savefig(output_path, dpi=100)
    plt.close(fig)
    print(f"Graph saved to {output_path}")

def plot_phy_m4_ch6_2_q18():
    """
    Generates the graph for phy_m4_ch6-2, question 18 (Scenario 2).
    Description: Force vs. Time graph.
    Triangle with base 0-4s, peak 20N at 2s.
    """
    fig, ax = plt.subplots(figsize=(6, 4))
    
    # Data points
    x = [0, 2, 4]
    y = [0, 20, 0]
    
    # Plot the line
    ax.plot(x, y, 'b-', linewidth=2, label='Force')
    
    # Fill the area under the curve (Triangle)
    ax.fill_between(x, 0, y, color='lightgreen', alpha=0.5)
    
    # Dashed line for peak
    ax.plot([2, 2], [0, 20], 'k--', alpha=0.5)

    # Labels and Title
    ax.set_title("Force vs. Time")
    ax.set_xlabel("Time (t) [s]")
    ax.set_ylabel("Force (F) [N]")
    
    # Grid and Limits
    ax.grid(True, linestyle='--', alpha=0.7)
    ax.set_xlim(0, 5)
    ax.set_ylim(0, 25)
    
    # Annotate peak
    ax.text(2.1, 20, '(2, 20)', fontsize=10, verticalalignment='center')

    output_path = os.path.join('assets', 'images', 'phy_m4_ch6-2_q18.png')
    
    # Ensure the directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    plt.tight_layout()
    plt.savefig(output_path, dpi=100)
    plt.close(fig)
    print(f"Graph saved to {output_path}")

def plot_phy_m4_ch6_3_q15():
    """
    Generates the graph for phy_m4_ch6-3, question 15.
    Description: Force vs. Time graph (Triangle).
    Base width 0.2s, Height 500N.
    Points: (0,0) -> (0.1, 500) -> (0.2, 0).
    """
    fig, ax = plt.subplots(figsize=(6, 4))
    
    # Data points
    x = [0, 0.1, 0.2]
    y = [0, 500, 0]
    
    # Plot the line
    ax.plot(x, y, 'b-', linewidth=2, label='Force')
    
    # Fill the area
    ax.fill_between(x, 0, y, color='orange', alpha=0.5)
    
    # Dashed line for peak
    ax.plot([0.1, 0.1], [0, 500], 'k--', alpha=0.5)

    # Labels and Title
    ax.set_title("Force vs. Time")
    ax.set_xlabel("Time (t) [s]")
    ax.set_ylabel("Force (F) [N]")
    
    # Grid and Limits
    ax.grid(True, linestyle='--', alpha=0.7)
    ax.set_xlim(0, 0.3)
    ax.set_ylim(0, 600)
    
    # Annotate peak
    ax.text(0.1, 500, '(0.1, 500)', fontsize=10, verticalalignment='bottom', horizontalalignment='center')

    output_path = os.path.join('assets', 'images', 'phy_m4_ch6-3_q15.png')
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    plt.tight_layout()
    plt.savefig(output_path, dpi=100)
    plt.close(fig)
    print(f"Graph saved to {output_path}")

def plot_phy_m4_ch6_2_q35():
    """
    Generates the graph for phy_m4_ch6-2, question 35.
    Description: Force vs. Time graph (Trapezoid).
    Parallel sides 2s and 4s, Height 10N.
    Points: (0,0) -> (1,10) -> (3,10) -> (4,0).
    """
    fig, ax = plt.subplots(figsize=(6, 4))
    
    # Data points for symmetric trapezoid with base 4 and top 2 centered
    # t=0 to t=4. Top side length 2 means from t=1 to t=3.
    x = [0, 1, 3, 4]
    y = [0, 10, 10, 0]
    
    # Plot the line
    ax.plot(x, y, 'b-', linewidth=2, label='Force')
    
    # Fill the area
    ax.fill_between(x, 0, y, color='purple', alpha=0.5)

    # Labels and Title
    ax.set_title("Force vs. Time")
    ax.set_xlabel("Time (t) [s]")
    ax.set_ylabel("Force (F) [N]")
    
    # Grid and Limits
    ax.grid(True, linestyle='--', alpha=0.7)
    ax.set_xlim(0, 5)
    ax.set_ylim(0, 15)
    
    # Annotate points
    ax.text(1, 10, '(1, 10)', fontsize=9, verticalalignment='bottom', horizontalalignment='right')
    ax.text(3, 10, '(3, 10)', fontsize=9, verticalalignment='bottom', horizontalalignment='left')
    ax.text(4, 0, '(4, 0)', fontsize=9, verticalalignment='top', horizontalalignment='center')

    output_path = get_output_path('phy_m4_ch6-2_q35.png')
    
    # Ensure the directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    plt.tight_layout()
    plt.savefig(output_path, dpi=100)
    plt.close(fig)
    print(f"Graph saved to {output_path}")

def plot_phy_m4_ch6_4_q30():
    """
    Generates the graph for phy_m4_ch6-4, question 30.
    Description: Force vs. Time graph (Rectangle).
    Constant force 20N from t=0 to t=4.
    Points for filling: (0,0) -> (0,20) -> (4,20) -> (4,0).
    """
    fig, ax = plt.subplots(figsize=(6, 4))
    
    # Data points for line
    x = [0, 4]
    y = [20, 20]
    
    # Plot the line
    ax.plot(x, y, 'b-', linewidth=2, label='Force')
    
    # Fill the area
    ax.fill_between(x, 0, y, color='salmon', alpha=0.5)
    
    # Drop lines
    ax.plot([4, 4], [0, 20], 'k--', alpha=0.5)
    ax.plot([0, 0], [0, 20], 'k--', alpha=0.5)

    # Labels and Title
    ax.set_title("Force vs. Time")
    ax.set_xlabel("Time (t) [s]")
    ax.set_ylabel("Force (F) [N]")
    
    # Grid and Limits
    ax.grid(True, linestyle='--', alpha=0.7)
    ax.set_xlim(0, 5)
    ax.set_ylim(0, 25)
    
    # Annotate points
    ax.text(2, 20, 'F = 20 N', fontsize=12, verticalalignment='bottom', horizontalalignment='center')
    ax.text(4, 0, 't = 4 s', fontsize=10, verticalalignment='bottom', horizontalalignment='center')

    output_path = get_output_path('phy_m4_ch6-4_q30.png')
    
    # Ensure the directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    plt.tight_layout()
    plt.savefig(output_path, dpi=100)
    plt.close(fig)
    print(f"Graph saved to {output_path}")

def plot_phy_m5_ch8_5_q6():
    """
    Generates the Displacement-Time graph for phy_m5_ch8-5, question 6.
    Sine wave: A=0.2m, T=4s.
    """
    fig, ax = plt.subplots(figsize=(6, 4))
    t = np.linspace(0, 8, 400)
    x = 0.2 * np.sin(2 * np.pi * t / 4)
    
    ax.plot(t, x, 'b-', linewidth=2)
    ax.set_title("Displacement vs. Time")
    ax.set_xlabel("Time (t) [s]")
    ax.set_ylabel("Displacement (x) [m]")
    ax.grid(True, linestyle='--', alpha=0.7)
    ax.set_xlim(0, 8)
    ax.set_ylim(-0.25, 0.25)
    
    # Annotate Amplitude and Period
    ax.annotate('Amplitude (0.2)', xy=(1, 0.2), xytext=(2, 0.22),
                arrowprops=dict(facecolor='black', arrowstyle='->'))
    ax.annotate('Period (4s)', xy=(4, 0), xytext=(4.5, -0.1),
                arrowprops=dict(facecolor='black', arrowstyle='->'))

    output_path = get_output_path('phy_m5_ch8-5_q6.png')
    create_directory_if_not_exists(os.path.dirname(output_path))
    plt.tight_layout()
    plt.savefig(output_path, dpi=100)
    plt.close(fig)
    print(f"Graph saved to {output_path}")

def plot_phy_m5_ch8_5_q9():
    """
    Generates the Velocity-Time graph for phy_m5_ch8-5, question 9.
    Cosine wave: Vmax=4 m/s, T=2s.
    """
    fig, ax = plt.subplots(figsize=(6, 4))
    t = np.linspace(0, 4, 400)
    v = 4 * np.cos(2 * np.pi * t / 2)
    
    ax.plot(t, v, 'r-', linewidth=2)
    ax.set_title("Velocity vs. Time")
    ax.set_xlabel("Time (t) [s]")
    ax.set_ylabel("Velocity (v) [m/s]")
    ax.grid(True, linestyle='--', alpha=0.7)
    ax.set_xlim(0, 4)
    ax.set_ylim(-5, 5)
    
    # Annotate Vmax
    ax.annotate('Vmax (4)', xy=(0, 4), xytext=(0.5, 4.5),
                arrowprops=dict(facecolor='black', arrowstyle='->'))

    output_path = get_output_path('phy_m5_ch8-5_q9.png')
    create_directory_if_not_exists(os.path.dirname(output_path))
    plt.tight_layout()
    plt.savefig(output_path, dpi=100)
    plt.close(fig)
    print(f"Graph saved to {output_path}")

def plot_phy_m5_ch8_5_q12():
    """
    Generates the Acceleration-Displacement graph for phy_m5_ch8-5, question 12.
    Linear with negative slope: a = -40x.
    Points: (0.1, -4), (-0.1, 4).
    """
    fig, ax = plt.subplots(figsize=(6, 4))
    x = np.linspace(-0.15, 0.15, 100)
    a = -40 * x
    
    ax.plot(x, a, 'g-', linewidth=2)
    ax.set_title("Acceleration vs. Displacement")
    ax.set_xlabel("Displacement (x) [m]")
    ax.set_ylabel("Acceleration (a) [m/s²]")
    ax.grid(True, linestyle='--', alpha=0.7)
    
    # Mark points
    ax.plot(0.1, -4, 'ko')
    ax.text(0.11, -4, '(0.1, -4)', verticalalignment='center')
    ax.plot(-0.1, 4, 'ko')
    ax.text(-0.14, 4, '(-0.1, 4)', verticalalignment='center')
    
    # Draw axes through origin
    ax.spines['left'].set_position('zero')
    ax.spines['bottom'].set_position('zero')
    ax.spines['right'].set_color('none')
    ax.spines['top'].set_color('none')

    output_path = get_output_path('phy_m5_ch8-5_q12.png')
    create_directory_if_not_exists(os.path.dirname(output_path))
    plt.tight_layout()
    plt.savefig(output_path, dpi=100)
    plt.close(fig)
    print(f"Graph saved to {output_path}")

def plot_phy_m5_ch8_5_q21():
    """
    Generates the Potential Energy vs Displacement graph for phy_m5_ch8-5, question 21.
    Parabola opening up. U = 0.5 * k * x^2.
    Max U = 2.0 J at x = +/- 0.2 m.
    """
    fig, ax = plt.subplots(figsize=(6, 4))
    x = np.linspace(-0.25, 0.25, 100)
    # 2.0 = 0.5 * k * 0.04 => k = 100
    u = 0.5 * 100 * x**2
    
    ax.plot(x, u, 'm-', linewidth=2)
    ax.set_title("Potential Energy vs. Displacement")
    ax.set_xlabel("Displacement (x) [m]")
    ax.set_ylabel("Potential Energy (Ep) [J]")
    ax.grid(True, linestyle='--', alpha=0.7)
    ax.set_xlim(-0.3, 0.3)
    ax.set_ylim(0, 2.5)
    
    # Annotate points
    ax.plot(0.2, 2.0, 'ko')
    ax.text(0.21, 2.0, '(0.2, 2.0)', verticalalignment='center')
    ax.plot(-0.2, 2.0, 'ko')
    ax.text(-0.21, 2.0, '(-0.2, 2.0)', verticalalignment='center', horizontalalignment='right')

    output_path = get_output_path('phy_m5_ch8-5_q21.png')
    create_directory_if_not_exists(os.path.dirname(output_path))
    plt.tight_layout()
    plt.savefig(output_path, dpi=100)
    plt.close(fig)
    print(f"Graph saved to {output_path}")

def plot_phy_m5_ch8_5_q24():
    """
    Generates the Kinetic Energy vs Time graph for phy_m5_ch8-5, question 24.
    Sine squared shape. Max Ek = 8 J.
    Starts at 0, peaks at 1s, 0 at 2s. Period of motion is 4s.
    """
    fig, ax = plt.subplots(figsize=(6, 4))
    t = np.linspace(0, 4, 400)
    # T_motion = 4s => omega = 2pi/4 = pi/2.
    # Ek = Emax * sin^2(omega * t) (starts at 0)
    ek = 8 * np.sin(np.pi/2 * t)**2
    
    ax.plot(t, ek, 'c-', linewidth=2)
    ax.set_title("Kinetic Energy vs. Time")
    ax.set_xlabel("Time (t) [s]")
    ax.set_ylabel("Kinetic Energy (Ek) [J]")
    ax.grid(True, linestyle='--', alpha=0.7)
    ax.set_xlim(0, 4.5)
    ax.set_ylim(0, 9)
    
    # Annotate peak
    ax.annotate('Max Ek (8J)', xy=(1, 8), xytext=(1.5, 8.5),
                arrowprops=dict(facecolor='black', arrowstyle='->'))

    output_path = get_output_path('phy_m5_ch8-5_q24.png')
    create_directory_if_not_exists(os.path.dirname(output_path))
    plt.tight_layout()
    plt.savefig(output_path, dpi=100)
    plt.close(fig)
    print(f"Graph saved to {output_path}")

def get_output_path(filename):
    """Returns the absolute path for the output image in public/assets/images."""
    # Assuming script is in tools/, go up one level to root, then public/assets/images
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(root_dir, 'public', 'assets', 'images', filename)

if __name__ == "__main__":
    # Generate graph
    # plot_phy_m4_ch6_5_q16() 
    # plot_phy_m4_ch6_2_q18()
    # plot_phy_m4_ch6_3_q15()
    # plot_phy_m4_ch6_2_q35()
    # plot_phy_m4_ch6_4_q30()
    plot_phy_m5_ch8_5_q6()
    plot_phy_m5_ch8_5_q9()
    plot_phy_m5_ch8_5_q12()
    plot_phy_m5_ch8_5_q21()
    plot_phy_m5_ch8_5_q24()
    print("\nGraph generation complete.")