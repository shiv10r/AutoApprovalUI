import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './RequestTable.css'; // Import the updated CSS file

const RequestTable = () => {
    const [requests, setRequests] = useState([]);
    const [isAutoApproved, setIsAutoApproved] = useState(false);
    const [isRejectedAll, setIsRejectedAll] = useState(false);

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
            await axios.post('https://localhost:7082/api/Request/auto-approve-all');
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
            await axios.post('https://localhost:7082/api/Request/auto-reject-all');
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
        setIsAutoApproved(true);
        setIsRejectedAll(false);
        setRequests(prevRequests =>
            prevRequests.map((request) => ({ ...request, status: 'Approved', isChecked: true }))
        );
    };

    const rejectAll = () => {
        setIsAutoApproved(false);
        setIsRejectedAll(true);
        setRequests(prevRequests =>
            prevRequests.map((request) => ({ ...request, status: 'Rejected', isChecked: false }))
        );
    };

    const getButtonClass = (status, action) => {
        if (action === 'approve') {
            return status === 'Approved' || isAutoApproved ? 'approve-btn green' : 'approve-btn blue';
        } else if (action === 'reject') {
            return status === 'Rejected' || isRejectedAll ? 'reject-btn red' : 'reject-btn blue';
        }
        return '';
    };

    const getCheckboxClass = (status) => {
        if (status === 'Approved') {
            return 'approved-checkbox';
        } else if (status === 'Rejected') {
            return 'rejected-checkbox';
        } else if (status === 'Pending') {
            return 'pending-checkbox';
        }
        return '';
    };

    return (
        <div className="table-container">
            <h2>welcome to Auto Approver</h2>

            {/* Button Group for Auto Approve and Reject All */}
            <div className="button-group">
                <button onClick={autoApproveAll} className="auto-approve-btn">Auto Approve All</button>
                <button onClick={rejectAll} className="reject-all-btn">Reject All</button>
            </div>

            {/* Table for displaying requests */}
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Status</th>
                        <th>Timestamp</th>
                        <th>Actions</th>
                        <th>Status Checkbox</th>
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
                                <span className={getCheckboxClass(request.status)}>
                                    {request.status === 'Approved' && '✔'}
                                    {request.status === 'Rejected' && '❌'}
                                    {request.status === 'Pending' && '⭕'}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RequestTable;
