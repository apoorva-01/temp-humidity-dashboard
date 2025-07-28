import React, {  useState } from 'react';
import Button from '@mui/material/Button';
import styled from 'styled-components';

export default function UploadImage({setPicURL,picURL}) {
  const [file, setFile] = useState(null);

  function handleChange(e) {
    setFile(e.target.files[0]);
  }


  function handleUpload(e) {
    e.preventDefault();

    
  }

  const ImageInput = styled.input`
  cursor: pointer;
  width: 180px;
  height: 34px;
  overflow: hidden;
     &:before {
      width: 158px;
      height: 32px;
      font-size: 16px;
      line-height: 32px;
      content: 'Select your file';
      display: inline-block;
      background: white;
      border: 1px solid #000;
      padding: 0 10px;
      text-align: center;
     }
     &::-webkit-file-upload-button {
      visibility: hidden;
    }
   `;

  return (
    <div>
      <form onSubmit={handleUpload}>
        <ImageInput type="file" onChange={handleChange} />
        <Button type="submit" disabled={!file} variant="outlined">Upload</Button>
      </form>
      {/* <img src={picURL} alt="" width="100%"/> */}
    </div>
  );
}