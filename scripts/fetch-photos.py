#!/usr/bin/env python3
"""
Download destination photography from Wikimedia Commons into assets/source/.

Wikimedia rate-limits aggressively per IP, so this goes slowly and skips
files you already have. Run it from your own machine, then:

    npm run images        # → public/images/*.webp

and remove the destination's slug from PENDING_PHOTOS in lib/data.ts.
Every file is credited in lib/credits.json (shown at /credits).
"""
import os
import time
import urllib.request

UA = "RosarioTravelSite/1.0 (https://github.com/marvinmcv-svg/Rosario-Travel-Agency-Spinning-Wheel; photo fetch script) python-urllib"
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets", "source")

# (paine-cuernos and machu-picchu* come from Unsplash, see lib/credits.json.)
# Standard Commons thumbnail widths only (1920 / 3840) — other sizes are refused.
FILES = {
    "uyuni-mirror": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Uyuni_Salt_Lake_%28Salar_de_Uyuni%29%2C_Bolivia%2C_12-2022.jpg/3840px-Uyuni_Salt_Lake_%28Salar_de_Uyuni%29%2C_Bolivia%2C_12-2022.jpg",
    "uyuni-cruiser": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Reflection_on_the_Salar_de_Uyuni%2C_bolivia.jpg/3840px-Reflection_on_the_Salar_de_Uyuni%2C_bolivia.jpg",
    "uyuni-sunset": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Salar_de_Uyuni%2C_Bolivia%2C_2016-02-04%2C_DD_25-27_HDR.JPG/3840px-Salar_de_Uyuni%2C_Bolivia%2C_2016-02-04%2C_DD_25-27_HDR.JPG",
    "uyuni-island": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Salar_de_Uyuni%2C_Bolivia%2C_2016-02-04%2C_DD_10-12_HDR.JPG/3840px-Salar_de_Uyuni%2C_Bolivia%2C_2016-02-04%2C_DD_10-12_HDR.JPG",
    "titicaca-sunset": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Atardecer_en_el_lago_Titicaca%2C_Copacabana._Bolivia.jpg/1920px-Atardecer_en_el_lago_Titicaca%2C_Copacabana._Bolivia.jpg",
    "titicaca-uros": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Die_Uru_Kultur_auf_dem_Titicaca-Seeee.jpg/3840px-Die_Uru_Kultur_auf_dem_Titicaca-Seeee.jpg",
    "titicaca-dawn": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Amanecer_en_el_lago_Titicaca%2C_Puno%2C_Per%C3%BA%2C_2015-08-01%2C_DD_01.JPG/3840px-Amanecer_en_el_lago_Titicaca%2C_Puno%2C_Per%C3%BA%2C_2015-08-01%2C_DD_01.JPG",
    "titicaca-isla": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Lago_Titicaca_La_Paz.jpg/3840px-Lago_Titicaca_La_Paz.jpg",
    "vinicunca": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Vinicunca%2C_Rainbow_Mountain.jpg/1920px-Vinicunca%2C_Rainbow_Mountain.jpg",
    "vinicunca-ridge": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Monta%C3%B1a_Arco%C3%ADris.jpg/3840px-Monta%C3%B1a_Arco%C3%ADris.jpg",
    "laguna-flamingos": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/James%27s_Flamingoes_in_Laguna_Colorada%2C_Bolivia.jpg/3840px-James%27s_Flamingoes_in_Laguna_Colorada%2C_Bolivia.jpg",
    "laguna-colorada": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Laguna_Colorada%2C_Bolivia%2C_2016-02-02%2C_DD_83-87_PAN.JPG/3840px-Laguna_Colorada%2C_Bolivia%2C_2016-02-02%2C_DD_83-87_PAN.JPG",
    "cusco-plaza": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Iglesia_de_la_Compa%C3%B1%C3%ADa_de_Jes%C3%BAs%2C_Plaza_de_Armas%2C_Cusco%2C_Per%C3%BA%2C_2015-07-31%2C_DD_74.JPG/3840px-Iglesia_de_la_Compa%C3%B1%C3%ADa_de_Jes%C3%BAs%2C_Plaza_de_Armas%2C_Cusco%2C_Per%C3%BA%2C_2015-07-31%2C_DD_74.JPG",
    "cusco-night": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Plaza_de_Armas_-_Cusco_at_night.jpg/3840px-Plaza_de_Armas_-_Cusco_at_night.jpg",
    "tiwanaku-gate": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Bolivia_-_Gate_of_the_Sun_detail_-_Tiwanaku_or_Tiahuanaco_01.jpg/3840px-Bolivia_-_Gate_of_the_Sun_detail_-_Tiwanaku_or_Tiahuanaco_01.jpg",
    "tiwanaku-heads": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Templete_Semisubterr%C3%A1neo_%E2%80%94_Cabezas_talladas%2C_Tiwanaku%2C_Bolivia.jpg/3840px-Templete_Semisubterr%C3%A1neo_%E2%80%94_Cabezas_talladas%2C_Tiwanaku%2C_Bolivia.jpg",
    "atacama-anfiteatro": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Anfiteatro%2C_Valle_de_la_Luna%2C_San_Pedro_de_Atacama%2C_Chile%2C_2016-02-01%2C_DD_153.JPG/3840px-Anfiteatro%2C_Valle_de_la_Luna%2C_San_Pedro_de_Atacama%2C_Chile%2C_2016-02-01%2C_DD_153.JPG",
    "atacama-dune": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Duna_Mayor%2C_Valle_de_la_Luna%2C_San_Pedro_de_Atacama%2C_Chile%2C_2016-02-01%2C_DD_163.JPG/3840px-Duna_Mayor%2C_Valle_de_la_Luna%2C_San_Pedro_de_Atacama%2C_Chile%2C_2016-02-01%2C_DD_163.JPG",
    "paine-towers": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Towers_of_Paine_-_Torres_del_Paine_National_Park_13.jpg/3840px-Towers_of_Paine_-_Torres_del_Paine_National_Park_13.jpg",
    "paine-dawn": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Cuernos_del_Paine_in_Torres_del_Paine_National_Park.jpg/3840px-Cuernos_del_Paine_in_Torres_del_Paine_National_Park.jpg",
    "iguazu": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Iguazu-Falls-January-2013.jpg/1920px-Iguazu-Falls-January-2013.jpg",
    "iguazu-gorge": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Iguazu_Falls_Salto_Rivadavia_2019.jpg/3840px-Iguazu_Falls_Salto_Rivadavia_2019.jpg",
    "amazon": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Amazon_CIAT_%283%29.jpg/3840px-Amazon_CIAT_%283%29.jpg",
    "amazon-mist": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Amazon4.jpg/3840px-Amazon4.jpg"
}


def main() -> None:
    os.makedirs(OUT, exist_ok=True)
    for name, url in FILES.items():
        out = os.path.join(OUT, f"{name}.jpg")
        if os.path.exists(out) and os.path.getsize(out) > 0:
            continue
        for attempt in range(5):
            try:
                data = urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=120).read()
                open(out, "wb").write(data)
                print(f"✓ {name} ({len(data) // 1024} KB)")
                break
            except Exception as e:  # 429 = rate limited: wait and retry
                print(f"  {name}: {e} — retrying")
                time.sleep(20 * (attempt + 1))
        time.sleep(4)


if __name__ == "__main__":
    main()
