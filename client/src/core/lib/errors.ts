export interface AppError {
  type: string;
  message: string;
  code: number;
}

export const handleApiError = (
  error: any
): { success: false; error: AppError } => {
  console.error("API error:", error);

  if (error.response?.data?.type) {
    // Backend returned a structured error
    return {
      success: false,
      error: {
        type: error.response.data.type,
        message: error.response.data.message,
        code: error.response.status,
      },
    };
  } else if (error.request) {
    // Network error
    return {
      success: false,
      error: {
        type: "NETWORK_ERROR",
        message: "Connection failed. Check your network and retry.",
        code: 503,
      },
    };
  } else if (error.code === "ECONNREFUSED") {
    // Connection refused
    return {
      success: false,
      error: {
        type: "CONNECTION_ERROR",
        message: "Connection failed. Check your network and retry.",
        code: 503,
      },
    };
  }

  // Generic error
  return {
    success: false,
    error: {
      type: "UNKNOWN_ERROR",
      message: error.message || "An unexpected error occurred",
      code: 500,
    },
  };
};

export function errorMessage(error: any): { message: string } {
  return {
    message:
      error instanceof Error ? error.message : "An unexpected error occurred",
  };
}
