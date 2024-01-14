import multer from 'multer';
const storage = multer.memoryStorage();
const multerBodyParser = multer({ storage: storage });

export default multerBodyParser;
