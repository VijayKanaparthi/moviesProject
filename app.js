const express = require('express')
const app = express()

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const path = require('path')
const dbPath = path.join(__dirname, 'moviesData.db')

app.use(express.json())

let db = null

const initilzeDBServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
initilzeDBServer()
const convertMovieObject = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  }
}

const convert = dbObject => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  }
}
// Get All Movies
app.get(`/movies/`, async (request, response) => {
  const getAllMovies = `
  SELECT movie_name
  FROM movie;
  `
  const movies = await db.all(getAllMovies)
  response.send(movies.map(eachMovie => ({movieName: eachMovie.movie_name})))
})

//GET one Movie
app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getOneMovieQuery = `
  SELECT * FROM movie WHERE movie_id = ${movieId}
  `
  const oneMovie = await db.get(getOneMovieQuery)
  response.send(convertMovieObject(oneMovie))
})

//Post Method

app.post('/movies/', async (request, response) => {
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const createMovieQuery = `
  INSERT INTO movie (director_id,movie_name,lead_actor) VALUES 
  (${directorId},
  '${movieName}',
   '${leadActor}'
   )`
  await db.run(createMovieQuery)
  response.send('Movie Successfully Added')
})

// PUT Method
app.put(`/movies/:movieId/`, async (request, response) => {
  const {movieId} = request.params
  const movieDetails = request.body

  const {directorId, movieName, leadActor} = movieDetails

  const updateQuery = `
  UPDATE movie 
  SET 
    director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor ='${leadActor}'
  WHERE movie_id = ${movieId}`

  await db.run(updateQuery)
  response.send('Movie Details Updated')
})

//DELETE Method
app.delete(`/movies/:movieId/`, async (request, response) => {
  const {movieId} = request.params
  const deleteQuery = `
  DELETE FROM movie WHERE movie_id = ${movieId}
`
  await db.run(deleteQuery)
  response.send('Movie Removed')
})

//GEt From Directories Folder
app.get(`/directors/`, async (request, response) => {
  const {directorId} = request.params
  const getDirectersQuery = `
  SELECT * FROM director ;
  `
  const directorlist = await db.all(getDirectersQuery)
  response.send(directorlist.map(eachD => convert(eachD)))
})

app.get(`/directors/:directorId/movies/`, async (request, response) => {
  const {directorId} = request.params
  const getDirectorQuery = `
  SELECT movie_name 
  FROM movie
  WHERE 
  director_id = '${directorId}';
  `
  const moviesArray = await db.all(getDirectorQuery)
  response.send(
    moviesArray.map(eachMovie => ({movieName: eachMovie.movie_name})),
  )
})

module.exports = app
