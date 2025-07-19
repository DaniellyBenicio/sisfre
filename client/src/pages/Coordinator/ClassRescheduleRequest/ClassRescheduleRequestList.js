import { useState } from "react";
import {
	Box,
	Typography,
	Grid,
	Card,
	CardContent,
	CardActionArea,
} from "@mui/material";
import { Visibility, MailOutline } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Paginate from "../../../components/paginate/Paginate";

const ClassRecheduleRequestOptions = ({ setAuthenticated }) => {
	const navigate = useNavigate();
	const accessType = localStorage.getItem("accessType") || "";
	const [page, setPage] = useState(1);
  const itemsPerPage = 6;

	const RequestOptions = [
		{
			icon: MailOutline,
			title: "Reposição",
			teacher: "Professor: João Silva",
			date: "Data: 17/07/2025",
		},
		{
			title: "Anteposição",
			teacher: "Professor: Maria Oliveira",
			date: "Data: 17/07/2025",
			path: "/class-reschedule-request"
		},
		{
			title: "Anteposição",
			teacher: "Professor: Maria Oliveira",
			date: "Data: 17/07/2025",
			path: "/class-reschedule-request"
		},
		{
			title: "Anteposição",
			teacher: "Professor: Maria Oliveira",
			date: "Data: 17/07/2025",
			path: "/class-reschedule-request"
		},
		{
			title: "Anteposição",
			teacher: "Professor: Maria Oliveira",
			date: "Data: 17/07/2025",
			path: "/class-reschedule-request"
		},
		{
			title: "Anteposição",
			teacher: "Professor: Maria Oliveira",
			date: "Data: 17/07/2025",
			path: "/class-reschedule-request"
		},
		{
			title: "Anteposição",
			teacher: "Professor: Maria Oliveira",
			date: "Data: 17/07/2025",
			path: "/class-reschedule-request"
		}
	];

	const handleCardClick = (option) => {
		const targetPath = accessType === "Admin" && option.adminPath ? option.adminPath : option.path;
		navigate(targetPath);
	};

	const totalItems = RequestOptions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedOptions = RequestOptions.slice(startIndex, endIndex);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

	return (
		<Box sx={{ display: "flex", minWidth: "100vh" }}>
			<Box
				padding={3}
				sx={{
					width: "100%",
					margin: "0 auto",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					gap: 10,
				}}
			>
				<Typography
					variant="h5"
					gutterBottom
					sx={{
						fontWeight: "bold",
						textAlign: "center",
						mt: "40px"
					}}
				>
					Solicitações de Anteposição e Reposição
				</Typography>

				<Grid
					container
					spacing={5}
					justifyContent="center"
					sx={{
						width: "100%",
						overflow: "visible",
						display: "flex",
						flexWrap: "wrap",
					}}
				>
					{paginatedOptions.map((option) => (
            <Grid item xs={12} sm={6} md={4} key={option.id}>
							<Card
								sx={{
									width: { xs: 300, sm: 300 },
									height: { xs: 250, sm: 300 },
									backgroundColor: "#FFFFFF",
									boxShadow:
										"0 6px 12px rgba(8, 118, 25, 0.1), 0 3px 6px rgba(8, 118, 25, 0.05)",
									display: "flex",
									flexDirection: "column",
									justifyContent: "space-between",
									alignItems: "center",
									textAlign: "center",
									borderRadius: 3,
									border: "2px solid #087619",
									position: "relative",
									overflow: "visible",
									transition: "all 0.4s ease-in-out",
									"&:hover": {
										transform: "translateY(-10px)",
										boxShadow:
											"0 10px 20px rgba(8, 118, 25, 0.3), 0 0 10px rgba(8, 118, 25, 0.5)",
										border: "3px solid #0A8C1F",
									},
								}}
							>
								<Box
									sx={{
										position: "absolute",
										top: -2,
										left: 0,
										right: 0,
										height: "10px",
										backgroundColor: "#087619",
										borderTopLeftRadius: "12px",
										borderTopRightRadius: "12px",
										zIndex: 1,
										transition: "background-color 0.4s ease-in-out",
										"&:hover": {
											backgroundColor: "#0A8C1F",
										},
									}}
								/>

								<CardActionArea
									onClick={() => handleCardClick(option)}
									sx={{
										height: "100%",
										width: "100%",
										display: "flex",
										flexDirection: "column",
										justifyContent: "space-between",
										alignItems: "center",
										p: 2,
										zIndex: 2,
										"&:hover": {
											backgroundColor: "transparent",
										},
									}}
								>
									<CardContent
										sx={{ padding: 0, transition: "transform 0.4s ease-in-out", flexGrow: 1 }}
									>
										<Typography
											variant="h6"
											sx={{
												fontWeight: "bold",
												wordWrap: "break-word",
												color: "#087619",
												mt: 2,
												transition:
													"transform 0.4s ease-in-out, color 0.4s ease-in-out",
												"&:hover": {
													transform: "scale(1.05)",
													color: "#0A8C1F",
													fontSize: "1.3rem",
												},
											}}
										>
											{option.title}
										</Typography>
										<Typography
											variant="body1"
											sx={{
												mt: 2,
												color: "#333",
											}}
										>
											{option.teacher}
										</Typography>
										<Typography
											variant="body2"
											sx={{
												mt: 1,
												color: "#555",
											}}
										>
											{option.date}
										</Typography>
									</CardContent>
									<Box
										sx={{
											mb: 2,
											transition: "transform 0.4s ease-in-out",
											"&:hover": {
												transform: "scale(1.1)",
											},
										}}
									>
										<Visibility sx={{ fontSize: 40, color: "#087619" }} />
									</Box>
								</CardActionArea>
							</Card>
						</Grid>
					))}
				</Grid>
				<Paginate
          count={totalPages}
          page={page}
          onChange={handlePageChange}
        />
			</Box>
		</Box>
	);
};

export default ClassRecheduleRequestOptions;