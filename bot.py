import csv
import html
import json
import os
import random
import urllib.parse
import urllib.request


def main():
    token = os.environ["TG_TOKEN"]
    chat_id = os.environ["TG_CHAT_ID"]

    with open("phrases.csv", encoding="utf-8") as f:
        rows = list(csv.DictReader(f, delimiter=";"))

    row = random.choice(rows)
    es = html.escape(row["es"])
    ru = html.escape(row["ru"])
    text = f"🇪🇸 <tg-spoiler>{es}</tg-spoiler>\n🇷🇺 {ru}"

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    data = urllib.parse.urlencode({
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML",
    }).encode()
    with urllib.request.urlopen(urllib.request.Request(url, data=data)) as resp:
        json.load(resp)


if __name__ == "__main__":
    main()
