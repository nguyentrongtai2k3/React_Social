import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { isAuthenticated } from '../auth/';
import { read, update } from './apiUser';
import Ava from '../images/ava.png';

class EditProfile extends Component {
    constructor(){
        super();
        this.state = {
            id: "",
            name: "",
            email: "",
            password: "",
            redirectToProfile: false,
            error: "",
            loading: false,
            fileSize: 0
        }
    }

    init = userId => {
        const token = isAuthenticated().token;
        read(userId, token)
        .then(data => {
            //then kedua untuk mengambil data response json dari then pertama
            if(data.error){
                this.setState({redirectToProfile: true});
            }else{
                this.setState({
                    id: data.id,
                    name: data.name,
                    email: data.email
                });
            }
        });
    }

    componentDidMount(){
        this.userData = new FormData();
        const userId = this.props.match.params.userId;
        this.init(userId);
    }

    handleChange = (name) => (event) => {
        // console.log(name);
        // console.log(event.target.value)
        this.setState({
            error:"", 
            loading:false
        });
        
        const value = name === 'photo' ? event.target.files[0] : event.target.value;
        const fileSize = name === 'photo' ? event.target.files[0].size : 0;

        this.userData.set(name, value);
        this.setState({ 
            [name]: value, 
            fileSize 
        });
    }

    isValid = () => {
        const {name, email, password, fileSize} = this.state;

        if(fileSize >= 1250000){
            this.setState({error: "File size should be less than 10MB"});
            return false;
        }
        if(name.length === 0){
            this.setState({error: "Name is required"});
            return false;
        }
        if(email.length === 0){
            this.setState({error: "Email is required"});
            return false;
        }
        if(!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email)){
            this.setState({error: "a valid Email is required"});
            return false;
        }
        if(password.length >= 1 && password <= 5){
            this.setState({error: "password must be at least 6 characters long"});
            return false;
        }
        return true;
    }

    clickSubmit = event => {
        event.preventDefault();
        this.setState({loading: true});

        if(this.isValid()){
            const userId = this.props.match.params.userId;
            const token = isAuthenticated().token;
    
            update(userId, token, this.userData)
            .then(data => {
                if(data.error){
                    this.setState({error: data.error});
                }else{
                    this.setState({
                        redirectToProfile: true
                    })
                }
            });
        }
    }

    signupForm = (name, email, password) => (
        <form>
            <div className="form-group">
                <label className="text-muted">Photo</label>
                <input 
                    onChange={this.handleChange("photo")} 
                    type="file" 
                    accept="image/*"
                    className="form-control"
                />
            </div>
            <div className="form-group">
                <label className="text-muted">Name</label>
                <input 
                    onChange={this.handleChange("name")} 
                    type="text" 
                    className="form-control" 
                    value={name}
                />
            </div>
            <div className="form-group">
                <label className="text-muted">Email</label>
                <input 
                    onChange={this.handleChange("email")} 
                    type="email" 
                    className="form-control"
                    value={email}
                />
            </div>
            <div className="form-group">
                <label className="text-muted">Password</label>
                <input 
                    onChange={this.handleChange("password")} 
                    type="password" 
                    className="form-control"
                    value={password}
                />
            </div>
            <button onClick={this.clickSubmit} className="btn btn-raised btn-primary">
                UPDATE
            </button>
        </form>
    )

    render(){
        const {id, name, email, password, redirectToProfile, error, loading} = this.state;

        if(redirectToProfile){
            return <Redirect to={`/user/${id}`}/>
        }

        const photoUrl = id ? `${process.env.REACT_APP_API_URL}/user/photo/${id}` : Ava;

        return (
            <div className="container">
                <h2 className="mt-5 mb-5">Edit Profile</h2>
                <div 
                    className="alert alert-danger"
                    style={{ display: error ? "" : "none"}}
                >
                    {error}
                </div>

                { loading ? (
                    <div className="jumbrotron text-center">
                        <h2>Loading...</h2>
                    </div>
                ) : (
                    ""
                )}

                <img src={photoUrl} alt={name}/>
                
                {this.signupForm(name, email, password)}
            </div>
        )
    }
}

export default EditProfile;