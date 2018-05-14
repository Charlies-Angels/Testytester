import React, {Component} from 'react';
import PrismCode from 'react-prism';
import 'prismjs';

class Describe extends Component {
  constructor(props) {
    super(props);
    this.state = {
      assertion: props.assertion
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.assertion !== prevState.assertion) {
      return {
        assertion: nextProps.assertion,
      }
    }
  }
  render() {
    const { describe, it, actual, input1 } = this.props;
    return (

      <PrismCode component="pre" className="language-javascript">
        {`describe('${describe}', () => {
    it('${it}', () => {
    assert.${this.state.assertion}(${actual}${input1 ? ',' + input1 : ''})
    })
  })`}
      </PrismCode>
    );
  }
}

export default Describe;
