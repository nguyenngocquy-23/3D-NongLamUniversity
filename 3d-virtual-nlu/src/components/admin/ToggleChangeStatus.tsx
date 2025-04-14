import React, { useState } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../redux/Store';
import { fetchFields } from '../../redux/slices/DataSlice';

type StatusToggleProps = {
  id: number;
  status: number;
  apiUrl: string; // URL để gọi PUT hoặc POST cập nhật status
};

const StatusToggle: React.FC<StatusToggleProps> = ({ id, status, apiUrl }) => {
  const [loading, setLoading] = useState(false);
  const [toggle, setToggle] = useState(status);
  const dispatch = useDispatch<AppDispatch>();

  const toggleStatus = async () => {
    setToggle(toggle === 1 ? 0 : 1);
    setLoading(true);

    try {
      console.log('apiUrl',apiUrl)
      console.log('id',id)
      console.log('sttatus',status)
      // Gửi API lên server
      await axios.post(apiUrl, {id: id, status: status });
      dispatch(fetchFields());
    } catch (err) {
      console.error('Cập nhật trạng thái thất bại:', err);
      alert('Không thể cập nhật trạng thái!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleStatus}
      disabled={loading}
      style={{
        padding: '6px 12px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: toggle === 0 ? '#4CAF50' : '#f44336',
        color: 'white',
        cursor: 'pointer',
        opacity: loading ? 0.6 : 1,
      }}
    >
      {loading ? 'Đang gửi...' : toggle === 0 ? 'Bật' : 'Tắt'}
    </button>
  );
};

export default StatusToggle;
