import React, { Component } from 'react';
import './FileForm.css';
import { DropdownButton, MenuItem, Button, FormControl } from 'react-bootstrap';

//form to collect image from user and other parameters
class FileForm extends Component {
  render() {
    let dimensions, rangeInput, submit;
    //if filewidth is valid then a valid image file was selected
    //create dimensions and rangeInput component and enable submit button
    if (this.props.formData.fileWidth) {
      let resultWidth, resultHeight, dimensionsStr;
      resultHeight = Math.floor(this.props.formData.fileHeight / this.props.formData.squareSize);
      resultWidth = Math.floor(this.props.formData.fileWidth/ this.props.formData.squareSize);
      dimensionsStr = resultWidth.toString() + "x" + resultHeight.toString();
      dimensions = <div className="dimensions-text">{dimensionsStr}</div>;

      rangeInput = (
        <div>
          <input className="square-size-slider" type="range" min={this.props.formData.min} max={this.props.formData.max} step="1" value={this.props.formData.squareSize} onChange={this.props.onChange} />
        </div>
        );

      submit = (
        <Button onClick={this.props.onChange}>
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
      <div className="form">
        <span className="form-item">
          <FormControl
            type="file"
            accept="image/*"
            onChange={this.props.onChange}
          />
        </span>
        <span className="form-item">
          {dimensions}
          {rangeInput}
        </span>
        <span className="form-item">
          <DropdownButton bsStyle="default" title={this.props.formData.platform} onSelect={this.props.onChange}>
            <MenuItem eventKey={{target: {type: "dropdown", value: "apple"}}}>Apple</MenuItem>
            <MenuItem eventKey={{target: {type: "dropdown", value: "google"}}}>Google</MenuItem>
            <MenuItem eventKey={{target: {type: "dropdown", value: "facebook"}}}>Facebook</MenuItem>
            <MenuItem eventKey={{target: {type: "dropdown", value: "facebook-messenger"}}}>Facebook-Messenger</MenuItem>
            <MenuItem eventKey={{target: {type: "dropdown", value: "twitter"}}}>Twitter</MenuItem>
            <MenuItem eventKey={{target: {type: "dropdown", value: "emojione"}}}>Emojione</MenuItem>
          </DropdownButton>
        </span>
        <span className="form-item">
          {submit}
        </span>
      </div>
    );
  }
}
export default FileForm;