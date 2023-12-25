import mongoose from 'mongoose';

const idCardSchema = new mongoose.Schema({
  idNumber: {
    type: String,
  },
  name: {
    type: String,
  },
  lastName: {
    type: String,
  },
  dateOfBirth: {
    type: String,
  },
  dateOfIssue: {
    type: String,   
  },
  dateOfExpiry: {
    type: String,  
  },
});

const IdCard = mongoose.model('IdCard', idCardSchema);

export default IdCard;
