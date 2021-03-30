import React from 'react';
import './FileForm.css';
import { Dropdown, DropdownButton, Button, FormControl } from 'react-bootstrap';

//form to collect image from user and other parameters
function FileForm(props) {
  let dimensions, rangeInput, submit;
  //if filewidth is valid then a valid image file was selected
  //create dimensions and rangeInput component and enable submit button
  if (props.formData.fileWidth) {
    let resultWidth, resultHeight, dimensionsStr;
    resultHeight = Math.floor(props.formData.fileHeight / props.formData.squareSize);
    resultWidth = Math.floor(props.formData.fileWidth/ props.formData.squareSize);
    dimensionsStr = resultWidth.toString() + "x" + resultHeight.toString();
    dimensions = <div className="dimensions-text">{dimensionsStr}</div>;

    rangeInput = (
      <div>
        <input className="square-size-slider" type="range" min={props.formData.min} max={props.formData.max} step="1" value={props.formData.squareSize} onChange={props.onChange} />
      </div>
      );

    submit = (
      <Button onClick={props.onChange}>
        create
      </Button>
        )
  }
  else {
    //no file is selected disable submit button
    submit = (
    <Button disabled>
      create
    </Button>
    )
  }

  return (
    <div className="form d-flex flex-row">
      <span className="form-item">
        <FormControl
          type="file"
          accept="image/*"
          onChange={props.onChange}
        />
      </span>
      <span className="form-item">
        {dimensions}
        {rangeInput}
      </span>
      <span className="form-item">
        <DropdownButton title={props.formData.platform} onSelect={props.onChange}>
          <Dropdown.Item eventKey={"apple"}>Apple</Dropdown.Item>
          <Dropdown.Item eventKey={"google"}>Google</Dropdown.Item>
          <Dropdown.Item eventKey={"facebook"}>Facebook</Dropdown.Item>
          <Dropdown.Item eventKey={"facebook-messenger"}>Facebook-Messenger</Dropdown.Item>
          <Dropdown.Item eventKey={"twitter"}>Twitter</Dropdown.Item>
          <Dropdown.Item eventKey={"emojione"}>Emojione</Dropdown.Item>
        </DropdownButton>
      </span>
      <span className="form-item">
        {submit}
      </span>
    </div>
  );
}
export default FileForm;