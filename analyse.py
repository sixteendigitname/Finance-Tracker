import pandas as pd
import matplotlib as mpl
import argparse
import sys 

def main():
    parser = argparse.ArgumentParser(description="Summarize expenses from a JSON export.")
    parser.add_argument("path", nargs="?", default="expenses.json", help="path to the JSON file")
    args = parser.parse_args()
    try:
        df = pd.read_json(args.path, dtype={"id": str})
    except(FileNotFoundError):
        print(f"File not found: {args.path}.")
        sys.exit(1)
    except(ValueError):
        print(f"Could not read {args.path}: Invalid JSON.")
        sys.exit(1)

    if df.empty:
        print("No expenses to analyse.")
        sys.exit(0)

    df["date"] = pd.to_datetime(df["date"])

    print(f"Total spending: {df['price'].sum():.2f}")
    print(f"Average spending: {df['price'].mean():.2f}")
    print(f"Median spending: {df['price'].median():.2f}")
    print(f"Max spending: {df['price'].max():.2f}")
    print(f"No. of rows: {df['price'].count():.2f}")

    by_category = df.groupby("category")["price"].agg(["sum", "mean", "count"])
    by_category["percent"] = by_category["sum"] / df['price'].sum() * 100
    by_category = by_category.sort_values("sum", ascending=False)
    print(by_category.round(2)) 

    df["date"].dt.to_period("M")

    
    print(df.head())
    print(df.dtypes)

if __name__ == "__main__":
    main()
