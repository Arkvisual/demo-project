import fs from "fs";
import axios from "axios";
import FormData from "form-data";

const form = new FormData();
form.append("image", fs.createReadStream("D:/demoproject/backend/verified_originals/Original1.jpg"));

axios.post("http://localhost:5000/upload", form, {
  headers: form.getHeaders(),
})
.then(res => console.log(res.data))
.catch(err => console.error(err.response?.data || err.message));
