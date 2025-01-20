import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './RequestTable.css';

const RequestTable = () => {
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await axios.get('https://localhost:7082/api/Request');
                setRequests(response.data);
            } catch (error) {
                console.error('Error fetching the requests:', error);
            }
        };

        fetchRequests();

        const interval = setInterval(() => {
            autoApproveAll();
            rejectAll();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const approveRequest = async (id) => {
        try {
            await axios.post(`https://localhost:7082/api/Request/approve/${id}`);
            setRequests(prevRequests =>
                prevRequests.map((request) =>
                    request.id === id ? { ...request, status: 'Approved', isChecked: true } : request
                )
            );
        } catch (err) {
            console.error('Error approving request:', err);
        }
    };

    const rejectRequest = async (id) => {
        try {
            await axios.post(`https://localhost:7082/api/Request/reject/${id}`);
            setRequests(prevRequests =>
                prevRequests.map((request) =>
                    request.id === id ? { ...request, status: 'Rejected', isChecked: false } : request
                )
            );
        } catch (err) {
            console.error('Error rejecting request:', err);
        }
    };

    const autoApproveAll = () => {
        setRequests(prevRequests =>
            prevRequests.map((request) => ({ ...request, status: 'Approved', isChecked: true }))
        );
    };

    const rejectAll = () => {
        setRequests(prevRequests =>
            prevRequests.map((request) => ({ ...request, status: 'Rejected', isChecked: false }))
        );
    };

    const getButtonClass = (status, action) => {
        if (action === 'approve') {
            return status === 'Approved' ? 'approve-btn green' : 'approve-btn';
        } else if (action === 'reject') {
            return status === 'Rejected' ? 'reject-btn red' : 'reject-btn';
        }
        return '';
    };

    const getCheckboxClass = (status) => {
        if (status === 'Approved') {
            return 'approved-checkbox';
        } else if (status === 'Rejected') {
            return 'rejected-checkbox';
        }
        return '';
    };

    return (
        <div className="table-container">
            <h2>Welcome to Auto Approver</h2>

            <button onClick={autoApproveAll} className="auto-approve-btn">Auto Approve All</button>
            <button onClick={rejectAll} className="reject-all-btn">Reject All</button>

            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Status</th>
                        <th>Timestamp</th>
                        <th>Actions</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {requests.map((request) => (
                        <tr key={request.id}>
                            <td>{request.id}</td>
                            <td>{request.name}</td>
                            <td>{request.status}</td>
                            <td>{new Date(request.timestamp).toLocaleString()}</td>
                            <td>
                                <button onClick={() => approveRequest(request.id)} className={getButtonClass(request.status, 'approve')}>
                                    Approve
                                </button>
                                <button onClick={() => rejectRequest(request.id)} className={getButtonClass(request.status, 'reject')}>
                                    Reject
                                </button>
                            </td>
                            <td>
                                <input 
                                    type="checkbox" 
                                    className={getCheckboxClass(request.status)} 
                                    disabled 
                                    checked={request.isChecked} 
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RequestTable;
