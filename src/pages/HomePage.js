import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
    return (
        <div style={pageStyle}>
            <h2 style={headingStyle}>Home Page</h2>
            <p style={paragraphStyle}>Welcome to the home page!</p>
            <div style={{display: 'flex', flexDirection: 'column', gap: '1em'}}>
                <Link to="/map" style={linkStyle}>前往 Map 页面</Link>
                <Link to="/test" style={linkStyle}>前往 Test 页面</Link>
            </div>
        </div>
    );
}

const pageStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',        // 水平居中
    justifyContent: 'center',    // 垂直居中（可选）
    height: '100vh',             // 占满整个视口高度
    backgroundColor: '#e0f7fa',  // 设置背景颜色（浅蓝色）
    fontFamily: 'Arial, sans-serif', // 统一字体
};

const headingStyle = {
    fontSize: '2.5em',           // 更大的标题字体
    marginBottom: '1em',
};

const paragraphStyle = {
    fontSize: '1.2em',
    marginBottom: '2em',
};

const linkStyle = {
    textDecoration: 'none',
    color: '#0277bd',            // 更深的蓝色
    fontSize: '1.2em',
    padding: '0.5em 1em',
    backgroundColor: '#b3e5fc',  // 浅蓝色背景
    borderRadius: '8px',
};
