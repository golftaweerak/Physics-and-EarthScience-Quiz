import matplotlib.pyplot as plt
import numpy as np
import os

def create_directory_if_not_exists(path):
    """Creates a directory if it does not already exist."""
    if not os.path.exists(path):
        os.makedirs(path)

def plot_phy_m4_ch5_2_q16():
    """
    Generates the graph for phy_m4_ch5-2, question 16.
    Description: A trapezoidal graph of Force vs. Distance.
    Starts at (0, 10), goes to (4, 10), then linearly decreases to (10, 4).
    """
    fig, ax = plt.subplots()
    x = [0, 4, 10]
    y = [10, 10, 4]
    
    ax.plot(x, y, 'b-')
    ax.fill_between([0, 4], 0, 10, color='lightblue', alpha=0.5)
    ax.fill_between([4, 10], 0, [10, 4], color='lightblue', alpha=0.5, interpolate=True)
    
    ax.set_title("Force vs. Distance")
    ax.set_xlabel("Distance (s) [m]")
    ax.set_ylabel("Force (F) [N]")
    ax.grid(True)
    ax.set_xlim(0, 11)
    ax.set_ylim(0, 12)
    
    # Save the figure
    output_path = os.path.join('assets', 'images', 'phy_m4_ch5-2_q16.png')
    plt.savefig(output_path)
    plt.close(fig)
    print(f"Graph saved to {output_path}")

def plot_phy_m4_ch5_2_q17():
    """
    Generates the graph for phy_m4_ch5-2, question 17.
    Description: A triangular graph of Power vs. Time.
    Vertices at (0, 0), (8, 0), and (4, 50).
    """
    fig, ax = plt.subplots()
    x = [0, 4, 8]
    y = [0, 50, 0]
    
    ax.plot(x, y, 'g-')
    ax.fill_between(x, 0, y, color='lightgreen', alpha=0.5)
    
    ax.set_title("Power vs. Time")
    ax.set_xlabel("Time (t) [s]")
    ax.set_ylabel("Power (P) [W]")
    ax.grid(True)
    ax.set_xlim(0, 9)
    ax.set_ylim(0, 60)

    # Save the figure
    output_path = os.path.join('assets', 'images', 'phy_m4_ch5-2_q17.png')
    plt.savefig(output_path)
    plt.close(fig)
    print(f"Graph saved to {output_path}")

def plot_phy_m4_ch5_3_q11_to_q13():
    """
    Generates the graph for phy_m4_ch5-3, questions 11-13.
    Description: Force vs. Distance graph with a triangle and a rectangle.
    Triangle from (0,0) to (4,20), rectangle from (4,20) to (8,20).
    """
    fig, ax = plt.subplots()
    x = [0, 4, 8]
    y = [0, 20, 20]
    
    ax.plot(x, y, 'r-')
    ax.fill_between([0, 4], 0, [0, 20], color='lightcoral', alpha=0.5, interpolate=True)
    ax.fill_between([4, 8], 0, 20, color='lightcoral', alpha=0.5)

    ax.set_title("Force vs. Distance")
    ax.set_xlabel("Distance (x) [m]")
    ax.set_ylabel("Force (F) [N]")
    ax.grid(True)
    ax.set_xlim(0, 9)
    ax.set_ylim(0, 25)

    # Save the figure
    output_path = os.path.join('assets', 'images', 'phy_m4_ch5-3_q11.png')
    plt.savefig(output_path)
    plt.close(fig)
    print(f"Graph saved to {output_path}")

def plot_phy_m4_ch5_3_q32():
    """
    Generates the graph for phy_m4_ch5-3, question 32.
    Description: A rectangular graph of Power vs. Time.
    Vertices at (0,0), (10,0), (10,500), and (0,500).
    """
    fig, ax = plt.subplots()
    x = [0, 10]
    y = [500, 500]
    
    ax.plot(x, y, 'm-')
    ax.fill_between(x, 0, y, color='plum', alpha=0.5)
    
    ax.set_title("Power vs. Time")
    ax.set_xlabel("Time (t) [s]")
    ax.set_ylabel("Power (P) [W]")
    ax.grid(True)
    ax.set_xlim(0, 11)
    ax.set_ylim(0, 550)

    # Save the figure
    output_path = os.path.join('assets', 'images', 'phy_m4_ch5-3_q32.png')
    plt.savefig(output_path)
    plt.close(fig)
    print(f"Graph saved to {output_path}")

def plot_phy_m4_ch5_3_q25():
    """
    Generates the graph for phy_m4_ch5-3, questions 25-26.
    Description: A triangular graph of Force vs. Displacement.
    Vertices at (0,0), (6,0), and (6,30).
    """
    fig, ax = plt.subplots()
    x = [0, 6, 0]
    y = [0, 30, 0]
    
    ax.plot(x, y, 'c-')
    ax.fill_between([0, 6], 0, [0, 30], color='lightcyan', alpha=0.5, interpolate=True)
    
    ax.set_title("Force vs. Displacement")
    ax.set_xlabel("Displacement (x) [m]")
    ax.set_ylabel("Force (F) [N]")
    ax.grid(True)
    ax.set_xlim(0, 7)
    ax.set_ylim(0, 35)

    # Save the figure
    output_path = os.path.join('assets', 'images', 'phy_m4_ch5-3_q25.png')
    plt.savefig(output_path)
    plt.close(fig)
    print(f"Graph saved to {output_path}")

def plot_phy_m4_ch5_2_q26():
    """
    Generates the graph for phy_m4_ch5-2, question 26.
    Description: A linear graph of Force vs. Distance for a spring.
    Passes through (0,0) and (0.5, 100).
    """
    fig, ax = plt.subplots()
    x = [0, 0.5]
    y = [0, 100]
    
    ax.plot(x, y, 'orange', marker='o')
    
    ax.set_title("Force vs. Spring Extension")
    ax.set_xlabel("Extension (x) [m]")
    ax.set_ylabel("Force (F) [N]")
    ax.grid(True)
    ax.set_xlim(0, 0.6)
    ax.set_ylim(0, 110)

    # Save the figure
    output_path = os.path.join('assets', 'images', 'phy_m4_ch5-2_q26.png')
    plt.savefig(output_path)
    plt.close(fig)
    print(f"Graph saved to {output_path}")

def plot_phy_m4_ch5_2_q36():
    """
    Generates the graph for phy_m4_ch5-2, question 36.
    Description: A multi-part Force vs. Distance graph.
    (0,0) -> (4,20) -> (8,20) -> (12,0).
    """
    fig, ax = plt.subplots()
    x = [0, 4, 8, 12]
    y = [0, 20, 20, 0]
    
    ax.plot(x, y, 'purple')
    ax.fill_between(x, 0, y, color='violet', alpha=0.5)
    
    ax.set_title("Force vs. Distance")
    ax.set_xlabel("Distance (s) [m]")
    ax.set_ylabel("Force (F) [N]")
    ax.grid(True)
    ax.set_xlim(0, 13)
    ax.set_ylim(0, 25)

    # Save the figure
    output_path = os.path.join('assets', 'images', 'phy_m4_ch5-2_q36.png')
    plt.savefig(output_path)
    plt.close(fig)
    print(f"Graph saved to {output_path}")

if __name__ == "__main__":
    # Create the output directory if it doesn't exist
    create_directory_if_not_exists(os.path.join('assets', 'images'))

    # Generate all graphs
    plot_phy_m4_ch5_2_q16()
    plot_phy_m4_ch5_2_q17()
    plot_phy_m4_ch5_2_q26()
    plot_phy_m4_ch5_2_q36()
    plot_phy_m4_ch5_3_q11_to_q13()
    plot_phy_m4_ch5_3_q25()
    plot_phy_m4_ch5_3_q32()

    print("\nAll graphs generated successfully.")