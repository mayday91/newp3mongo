const mongoose = require('mongoose')
const Review = require('./review')
const db = require('../../config/db')

const startReviews = [
  { title: 'The Game - DRILLMATIC Heart vs. Mind',
    body: 'This album was all around dope. It covers sub-genres of hip hop I wasn\'t even aware I wanted to hear. This is a new level for The Game. I\'ve been a fan of him since his first major-label release "The Documentary" and he has impressed me with (almost) every album following that. This one is no exception. He has an untouchable cast of appearances that you could really only dream of having if you were anyone else.'
  },{
    title: 'Trapland Pat - Trapnificent',
    body: 'This is a huge deal for Trapland Pat. His major label debut and he does not disappoint with this one. Throughout the whole album there\'s a certain level of energy that few can keep up with. His bouncy fast-paced flow paired with oft comedic rhymes about his life and adventures in South Florida are always entertaining and he picks just the right songs to add to those flows with some features. A few notable appearances on the album are Fredo Bang (whom Trapland Pat is partially signed to at Bang Biz Records), and BIG 30 and Mozzy who have all fully established themselves in the game with a full list of bangers and massive fanbases that know every lyric. I look forward to what comes next from this young Florida jit.'
  
  }
]

// first connect to database
mongoose.connect(db, {
  useNewUrlParser: true
})
  .then(() => {
    // first we remove all pets
    Review.deleteMany({ owner: null })
      .then(deletedReviews => {
        console.log('deletedReviews', deletedReviews)
        // next step is to use startPets array to create seeded pets
        Review.create(startReviews)
          .then(newReviews => {
            console.log('the new reviews',newReviews)
            mongoose.connection.close()
          })
          .catch(error => {
            console.log(error)
            mongoose.connection.close()
          })
      })
      .catch(error => {
        console.log(error)
        mongoose.connection.close()
      })
  })
  .catch(error => {
    console.log(error)
    mongoose.connection.close()
  })