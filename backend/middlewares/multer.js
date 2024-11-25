const multer = require('multer')

const storage = multer.diskStorage({
    filename: function (req, file, cb) {
      
      cb(null, file.originalname)
    }
  })
  
  exports.upload = multer({ storage: storage })
  