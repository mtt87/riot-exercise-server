# Riot Exercise - Server
- Query Riot API to retrieve latest featured games
- Query Riot API to retrieve images links for champions and spells
- Cache everything on LevelDB
- Automatically request new data according to the suggested time
- Expose this data as an API for the client

### Prerequisite
[Node 6.x](https://nodejs.org/en/)  
Create a `.env` file in the root with your Riot API Key 
```bash
RIOT_API_KEY="this_is_not_secret"
```

### Installation
`npm install`

### Run the server
`npm start`
