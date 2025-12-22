import matplotlib.pyplot as plt
import numpy as np
import os

def create_directory_if_not_exists(path):
    """Creates a directory if it does not already exist."""
    if not os.path.exists(path):
        os.makedirs(path)

def plot_phy_m4_mid2_exam_4_q18():
    """
    Generates the graph for phy_m4_mid2-exam-4, question 18.
    Description: A trapezoidal graph of Force vs. Distance.
    Points: (0,0) -> (4,20) -> (8,20) -> (10,0).
    Area calculation: 0.5 * (4 * 20) + (4 * 20) + 0.5 * (2 * 20) = 40 + 80 + 20 = 140 J.
    """
    fig, ax = plt.subplots()
    x = [0, 4, 8, 10]
    y = [0, 20, 20, 0]
    
    ax.plot(x, y, 'b-', linewidth=2)
    ax.fill_between(x, 0, y, color='skyblue', alpha=0.5)
    
    ax.set_title("Force vs. Distance")
    ax.set_xlabel("Distance (s) [m]")
    ax.set_ylabel("Force (F) [N]")
    ax.grid(True, linestyle='--', alpha=0.7)
    ax.set_xlim(0, 11)
    ax.set_ylim(0, 25)
    
    # Save the figure
    output_path = os.path.join('assets', 'images', 'phy_m4_mid2-exam-4_q18.png')
    plt.savefig(output_path)
    plt.close(fig)
    print(f"Graph saved to {output_path}")

if __name__ == "__main__":
    # Create the output directory if it doesn't exist
    create_directory_if_not_exists(os.path.join('assets', 'images'))

    # Generate graph
    plot_phy_m4_mid2_exam_4_q18()

    print("\nAll graphs generated successfully.")