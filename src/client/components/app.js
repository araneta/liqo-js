import React,{Component} from 'react';

class App extends Component {

  render() {
    return (
      <div className="container">
        <form className="form-horizontal">
          <fieldset>
            <legend className="text-center">Mutaba'ah Online</legend>

            <div className="form-group">
              <label className="col-md-4 control-label" htmlFor="username">Username</label>
              <div className="col-md-4">
                <input id="username" name="username" type="text" placeholder="" className="form-control input-md" />
              </div>
            </div>

            <div className="form-group">
              <label className="col-md-4 control-label" htmlFor="password">Password</label>
              <div className="col-md-4">
                <input id="password" name="password" type="password" placeholder="" className="form-control input-md" />
              </div>
            </div>

            <div className="form-group">
              <label className="col-md-4 control-label" htmlFor="buttonLogin"></label>
              <div className="col-md-8">
                <button id="buttonLogin" name="buttonLogin" className="btn btn-success">Login</button>
                <button id="buttonRegistry" name="buttonRegistry" className="btn btn-primary">Register</button>
              </div>
            </div>
          </fieldset>
        </form>
      </div>
    );
  }

};

export default App;
