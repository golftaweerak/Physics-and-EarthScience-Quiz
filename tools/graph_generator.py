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

    output_path = os.path.join('assets', 'images', 'phy_m4_ch6-2_q35.png')
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    plt.tight_layout()
    plt.savefig(output_path, dpi=100)
    plt.close(fig)
    print(f"Graph saved to {output_path}")

if __name__ == "__main__":
    # Generate graph
    # plot_phy_m4_ch6_5_q16() # Commented out as it's already done
    plot_phy_m4_ch6_2_q18()
    plot_phy_m4_ch6_3_q15()
    plot_phy_m4_ch6_2_q35()
    print("\nGraph generation complete.")