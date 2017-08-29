import React, { Component } from 'react';
import './FileForm.css';
import { DropdownButton, MenuItem, Button, FormControl } from 'react-bootstrap';

//form to collect image from user and other parameters
class FileForm extends Component {
  render() {
    let dimensions;
    if (this.props.formData.fileHeight && this.props.formData.fileWidth) {
      let resultWidth, resultHeight;
      resultHeight = Math.floor(this.props.formData.fileHeight / this.props.formData.squareSize);
      resultWidth = Math.floor(this.props.formData.fileWidth/ this.props.formData.squareSize);
      dimensions = resultWidth.toString() + "x" + resultHeight.toString();
      dimensions = <div>{dimensions}</div>;
    }
    let rangeInput;
    if (this.props.formData.squareSize) {
      rangeInput = (
      <div>
        <input className="square-size-slider" type="range" min={this.props.formData.min} max={this.props.formData.max} step="1" value={this.props.formData.squareSize} onChange={this.props.onChange} />
      </div>
      );
    }

    return (
      <div className="form">
        <FormControl
          type="file"
          onChange={this.props.onChange}
        />
        <br />
        {dimensions}
        {rangeInput}
        <br />
        <DropdownButton bsStyle="default" title={this.props.formData.platform} onSelect={this.props.onChange}>
          <MenuItem eventKey={{target: {type: "dropdown", value: "apple"}}}>Apple</MenuItem>
          <MenuItem eventKey={{target: {type: "dropdown", value: "google"}}}>Google</MenuItem>
          <MenuItem eventKey={{target: {type: "dropdown", value: "facebook"}}}>Facebook</MenuItem>
          <MenuItem eventKey={{target: {type: "dropdown", value: "facebook-messenger"}}}>Facebook-Messenger</MenuItem>
          <MenuItem eventKey={{target: {type: "dropdown", value: "twitter"}}}>Twitter</MenuItem>
          <MenuItem eventKey={{target: {type: "dropdown", value: "emojione"}}}>Emojione</MenuItem>
        </DropdownButton>
        <br />
        <Button onClick={this.props.onChange}>
          create
        </Button>
      </div>
    );
  }
}
export default FileForm;