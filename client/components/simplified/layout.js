import React, { Component } from 'react';
import { connect } from 'react-redux';
import Header from './header';
import Objective from './objective';
import Editor from './editor';
import Describe from './describe';
import AssertButton from './assert-button';
import ClearRun from './clear-run';
import TestRunner from './test-runner';
import { assert } from '../test-object';
import { it } from '../../utils/tester';
import { postCodeToSandbox, getLevelsThunk, setLevel } from '../../store';

class Layout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectOne: '',
      input1: '',
      input2: '',
      testResponse: [],
      ranTests: [],
    };
  }
  componentDidMount() {
    this.props.setLevelOnLoad(0); // req params
    this.props.getLevelsThunk();
  }

  handleClickAssert = (method) => {
    this.setState({
      selectOne: method,
    });
  };

  clearForm = () => {
    this.setState({
      selectOne: '',
      input1: '',
      input2: '',
    });
  };

  runTest = () => {
    const { selectOne, input1, input2, ranTests, testResponse } = this.state;
    const inputs = [input1, input2];
    const level = this.props.levels.find(lev => lev.level === Number(0)); // req params
    const { itBlock, actual } = level;
    let sandbox = actual;
    if (assert[selectOne].pre) sandbox = assert[selectOne].pre + sandbox;
    if (assert[selectOne].post) sandbox = sandbox + assert[selectOne].post;

    this.props.postCodeToSandbox({ sandbox, level: 0 }) // req params
      .then(res => {
        let result = it(itBlock)(assert[selectOne])(res.sandbox, ...inputs);
        let str = `
it('${itBlock}',function(){
    assert.${selectOne}(${inputs[0] ? actual + ',' + inputs.join(',') : actual
  })
})
  `;
        this.setState({
          testResponse: [...testResponse, result],
          ranTests: [...ranTests, str],
        })
        if (result === itBlock) {
          this.clearForm();
        }
      })
      .catch(err => {
        console.log(err);
    })
  }

    render() {
    if (!this.props.levels.length) return <span />
    // CHANGE LEVEL ID TO Req params
    const thisLevel = this.props.levels.find(lev => lev.level === Number(0));
    const { level, func, objective, instructions, itBlock, tests, actual, title, testToPass } = thisLevel;
    const { selectOne, input1, testResponse } = this.state;

    return (
      <div className="layout-container">
        <Header active={level} />
        <div className="layout-body">

          <div className="left-side">
            <Objective level={level} title={title} instructions={instructions} />
            <Editor func={func} codeBlock={actual} />
          </div>

          <div className="right-side">
            <div className="test-block">
            <TestRunner objective={objective} it={itBlock} testResponse={testResponse} testToPass={testToPass} />
              <div className="send-test">
                <h4>Test Code Block:</h4>
                <div className="clear-send">
                  <ClearRun selectOne={selectOne} runTest={this.runTest} clearForm={this.clearForm} />
                </div>
            </div>

              <Describe describe={objective} assertion={selectOne} actual={actual} input1={input1} it={itBlock} />

              <h5>Choose an assertion: </h5>
              <div className="display-assertions">
              {tests.map(method => (
                  selectOne === method ?
                  <div className="assertion" key={method}>
                    <AssertButton active method={method} onClick={() => this.handleClickAssert(method)} />
                  </div> :
                  <div className="assertion" key={method}>
                  <AssertButton method={method} onClick={() => this.handleClickAssert(method)} />
                  </div>
              ))}
              </div>
              { selectOne && assert[selectOne].args.length > 1 &&
              <div>
                <h5>Add input for expected value: </h5>
                <div className="display-assertions">
                {assert[selectOne].args.slice(1).map((arg, i) => (
                  <input
                    key={arg}
                    className="input-yellow-sm"
                    placeholder="the expected output"
                    type="text"
                    value={this.state['input' + (i + 1)]}
                    name={arg}
                    onChange={event =>
                      this.setState({
                        ['input' + (i + 1)]: event.target.value,
                      })
                    } />
                  ))}
                  </div>
                </div>
              }
              </div>
          </div>

      </div>
    </div>
    );
  }
}

const mapState = state => ({
    level: state.level,
    levels: state.levels,
    sandbox: state.sandbox,
});

const mapDispatchToProps = dispatch => ({
    postCodeToSandbox: sandbox => dispatch(postCodeToSandbox(sandbox)),
    getLevelsThunk: () => dispatch(getLevelsThunk()),
    setLevelOnLoad: level => dispatch(setLevel(level)),
});

export default connect(mapState, mapDispatchToProps)(Layout);
