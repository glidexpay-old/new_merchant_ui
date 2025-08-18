"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { rehydrateAdmin } from "../redux/slices/adminSlice";
import { fetchAdminProfile } from "../redux/slices/adminProfileSlice";

export default function RehydrateAdmin() {
  const dispatch = useAppDispatch();
  const admin = useAppSelector((state) => state.admin.user);

  useEffect(() => {
    dispatch(rehydrateAdmin());
  }, [dispatch]);

  useEffect(() => {
    if (admin?.uuid) {
      dispatch(fetchAdminProfile());
    }
  }, [admin?.uuid, dispatch]);

  return null;
}
