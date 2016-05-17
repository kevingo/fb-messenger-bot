#!/bin/sh

for year in $(seq 1996 2013); do
  shortyear=$((year+1))
  season="${year}-${shortyear:2:2}"

  echo "Fetching ${season}..."

  for stat_type in Base Advanced Misc 'Four+Factors' Scoring Opponent; do
    url="http://stats.nba.com/stats/leaguedashteamstats?Season=${season}&SeasonType=Regular+Season&LeagueID=00&MeasureType=${stat_type}&PerMode=Totals&PlusMinus=N&PaceAdjust=N&Rank=N&Outcome=&Location=&Month=0&SeasonSegment=&DateFrom=&DateTo=&OpponentTeamID=0&VsConference=&VsDivision=&GameSegment=&Period=0&LastNGames=0&GameScope=&PlayerExperience=&PlayerPosition=&StarterBench=&sortField=PTS&sortOrder=DES&pageNo=1&rowsPerPage=30"
    filename="data/teams/${season}/$(tr '[:upper:]' '[:lower:]' <<< $stat_type).json"

    # Fetch older seasons if we haven't already and always fetch
    # the latest season
    if [ ! -f $filename ] || [ "${season}" = "2013-14" ]; then
      curl --create-dirs -# -o "$(pwd)/${filename}" $url
    fi

  done
done
