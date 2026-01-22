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

if __name__ == "__main__":
    # Generate graph
    plot_phy_m4_ch6_5_q16()
    print("\nGraph generation complete.")