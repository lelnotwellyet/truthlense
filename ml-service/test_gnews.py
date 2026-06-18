import requests

def query_gnews(query: str):
    apikey = "966197c3f5e93bcb23825dea80d40b72"
    url = f"https://gnews.io/api/v4/search?q={query}&lang=en&apikey={apikey}"
    try:
        res = requests.get(url)
        data = res.json()
        print(f"Query: {query}")
        print(f"Total articles found: {data.get('totalArticles', 0)}")
        articles = data.get('articles', [])
        for i, a in enumerate(articles[:3]):
            print(f"  {i+1}. {a['title']} ({a['source']['name']})")
    except Exception as e:
        print("Error:", e)

query_gnews("messi playing in 2026 fifa wc")
print("====================================")
query_gnews("messi playing in 2027 fifa wc")
